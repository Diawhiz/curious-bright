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

    // Always return our proxy URL to bypass CORS!
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.headers.host;
    const fileUrl = `${protocol}://${host}/books/${id}/download`;

    return res.json({
      fileUrl,
      cached: book.cacheStatus === 'CACHED',
      book,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to read book' });
  }
});

// 1.5 GET /books/:id/download - Proxy stream to bypass Gutenberg CORS
router.get('/:id/download', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const book = await prisma.book.findUnique({ where: { id } });
    if (!book || !book.originUrl) {
      return res.status(404).send('Book or origin URL not found');
    }

    // If they actually configured S3 properly, we can redirect to it
    if (book.cacheStatus === 'CACHED' && book.cachedFileUrl && !book.cachedFileUrl.includes('cdn.curiousbright.org')) {
      return res.redirect(book.cachedFileUrl);
    }

    // Proxy the stream from origin
    const originRes = await fetch(book.originUrl);
    if (!originRes.ok) {
      return res.status(originRes.status).send('Failed to fetch from origin');
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', originRes.headers.get('content-type') || 'application/epub+zip');
    
    // Stream response
    const arrayBuffer = await originRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    res.send(buffer);
  } catch (err) {
    res.status(500).send('Proxy error');
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
