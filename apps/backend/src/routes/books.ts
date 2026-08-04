import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { uploadBufferToS3 } from '../lib/s3';
import { runBookIngestion } from '../jobs/ingestBooks';
import { bookReadLimiter, bookIngestLimiter } from '../middleware/rateLimiter';


const router = Router();

// In-flight concurrency lock to prevent parallel fetches of the same uncached book
const inFlightFetches = new Map<string, Promise<string>>();

const STALENESS_MS = 90 * 24 * 60 * 60 * 1000; // 90 Days staleness window

// 1. GET /books/:id/read - Entry point to read a book with origin caching to R2/MinIO
router.get('/:id/read', bookReadLimiter, async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const book = await prisma.book.findUnique({ where: { id } });
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const now = new Date();
    const isRecentlyCached = 
      book.cacheStatus === 'CACHED' && 
      book.cachedFileUrl && 
      book.lastFetchedAt && 
      (now.getTime() - new Date(book.lastFetchedAt).getTime() < STALENESS_MS);

    // 1. Return cached URL directly if fresh
    if (isRecentlyCached) {
      return res.json({
        fileUrl: book.cachedFileUrl,
        cached: true,
        book,
      });
    }

    // 2. Handle uncached / stale / missing file
    if (!book.originUrl) {
      return res.status(400).json({ error: 'Book origin file URL is missing' });
    }

    // Check in-flight lock for concurrent requests
    if (inFlightFetches.has(book.id)) {
      const cachedFileUrl = await inFlightFetches.get(book.id)!;
      return res.json({ fileUrl: cachedFileUrl, cached: true, book });
    }

    // Create caching promise
    const fetchAndCachePromise = (async (): Promise<string> => {
      try {
        await prisma.book.update({
          where: { id: book.id },
          data: { cacheStatus: 'CACHING' },
        });

        if (!book.originUrl) {
          throw new Error('Book origin URL is missing');
        }

        console.log(`[Book Cache] Fetching origin file from ${book.originUrl}...`);
        const originRes = await fetch(book.originUrl);


        if (!originRes.ok) {
          throw new Error(`Failed to fetch from origin: ${originRes.statusText}`);
        }

        const arrayBuffer = await originRes.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const contentType = originRes.headers.get('content-type') || 'application/pdf';
        const ext = contentType.includes('epub') ? 'epub' : 'pdf';
        const key = `books/${book.source.toLowerCase()}/${book.sourceId}.${ext}`;

        console.log(`[Book Cache] Uploading ${buffer.length} bytes to R2 storage under key ${key}...`);
        const cachedUrl = await uploadBufferToS3(key, buffer, contentType);

        await prisma.book.update({
          where: { id: book.id },
          data: {
            cachedFileUrl: cachedUrl,
            cacheStatus: 'CACHED',
            lastFetchedAt: new Date(),
          },
        });

        return cachedUrl;
      } catch (err) {
        console.error(`[Book Cache] Error caching book ${book.id}:`, err);
        await prisma.book.update({
          where: { id: book.id },
          data: { cacheStatus: 'NOT_CACHED' },
        });
        // Fallback to origin URL on error
        return book.originUrl || '';

      } finally {
        inFlightFetches.delete(book.id);
      }
    })();

    inFlightFetches.set(book.id, fetchAndCachePromise);
    const fileUrl = await fetchAndCachePromise;

    return res.json({
      fileUrl,
      cached: fileUrl !== book.originUrl,
      book,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to read book' });
  }
});

// 2. GET /books - Catalog listing with level/subject/search filtering
router.get('/', async (req: Request, res: Response) => {
  const { academicLevel, subject, search } = req.query;

  try {
    // Scope enforcement: Curious Bright targets HIGH_SCHOOL and above only.
    // Exclude ELEMENTARY and MIDDLE_SCHOOL at query level.
    const allowedLevels = ['HIGH_SCHOOL', 'COLLEGE', 'GRADUATE', 'PROFESSIONAL'];

    let targetLevel: any = undefined;
    if (academicLevel && allowedLevels.includes(academicLevel as string)) {
      targetLevel = academicLevel;
    } else {
      targetLevel = { in: allowedLevels as any[] };
    }

    const where: any = {
      academicLevel: targetLevel,
    };

    if (subject) {
      where.subjectTags = { has: subject as string };
    }

    if (search) {
      const q = search as string;
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { author: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }

    const books = await prisma.book.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return res.json(books);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch book catalog' });
  }
});

// 3. POST /books/ingest - Trigger manual ingestion run
router.post('/ingest', bookIngestLimiter, async (_req: Request, res: Response) => {
  try {
    const summary = await runBookIngestion();
    return res.json({ message: 'Ingestion triggered successfully', summary });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Ingestion failed' });
  }
});

export default router;
