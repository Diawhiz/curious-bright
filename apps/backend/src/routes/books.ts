import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { uploadBufferToS3, s3, BUCKET_NAME } from '../lib/s3';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { runBookIngestion } from '../jobs/ingestBooks';
import { bookReadLimiter, bookIngestLimiter } from '../middleware/rateLimiter';
import { Readable } from 'stream';

const router = Router();

const inFlightFetches = new Map<string, Promise<string>>();
const STALENESS_MS = 90 * 24 * 60 * 60 * 1000;

router.get('/:id/read', bookReadLimiter, async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const book = await prisma.book.findUnique({ where: { id } });
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

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

router.get('/:id/download', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const book = await prisma.book.findUnique({ where: { id } });
    if (!book || !book.originUrl) {
      return res.status(404).send('Book or origin URL not found');
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    
    // Try S3 first if cached
    if (book.cacheStatus === 'CACHED') {
      try {
        const ext = book.originUrl.includes('.epub') ? 'epub' : 'pdf';
        const key = `books/${book.source.toLowerCase()}/${book.sourceId}.${ext}`;
        
        const command = new GetObjectCommand({
          Bucket: BUCKET_NAME,
          Key: key,
        });
        const s3Res = await s3.send(command);
        
        res.setHeader('Content-Type', s3Res.ContentType || 'application/epub+zip');
        if (s3Res.Body instanceof Readable) {
          s3Res.Body.pipe(res);
          return;
        }
      } catch (s3Err) {
        console.warn(`[Proxy] S3 fetch failed for ${book.id}, falling back to origin...`);
      }
    }

    // Proxy from origin (Gutenberg)
    const originRes = await fetch(book.originUrl);
    if (!originRes.ok) {
      return res.status(originRes.status).send('Failed to fetch from origin');
    }

    res.setHeader('Content-Type', originRes.headers.get('content-type') || 'application/epub+zip');
    
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
