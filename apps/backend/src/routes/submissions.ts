import { Router, Request, Response } from 'express';
import { PrismaClient } from '@curious-bright/database';
import { SubmissionSchema } from '@curious-bright/validation';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/role';
import { generatePresignedUploadUrl, BUCKET_NAME } from '../lib/s3';
import { sendPushNotification } from '../lib/push';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();
const router = Router();

// 1. POST /submissions/upload-url - Get a presigned URL
router.post('/upload-url', requireAuth, async (req: Request, res: Response) => {
  const { filename, contentType } = req.body;
  if (!filename || !contentType) {
    return res.status(400).json({ error: 'filename and contentType required' });
  }

  if (contentType !== 'application/pdf' && contentType !== 'application/epub+zip') {
    return res.status(400).json({ error: 'Only PDF or EPUB files are allowed' });
  }

  const extension = contentType === 'application/pdf' ? 'pdf' : 'epub';
  const key = `submissions/${uuidv4()}.${extension}`;

  try {
    const uploadUrl = await generatePresignedUploadUrl(key, contentType);
    
    // Default minio port mapped is 9000
    const publicUrl = process.env.NODE_ENV === 'production' 
      ? `https://${process.env.PUBLIC_S3_DOMAIN}/${key}`
      : `http://localhost:9000/${BUCKET_NAME}/${key}`;

    res.json({ uploadUrl, fileUrl: publicUrl });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to generate upload URL' });
  }
});

// 2. POST /submissions - Create a new submission
router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const data = SubmissionSchema.parse(req.body);
    
    const submission = await prisma.submission.create({
      data: {
        ...data,
        userId: req.user!.id,
        status: 'PENDING',
      },
    });

    res.status(201).json(submission);
  } catch (error: any) {
    res.status(400).json({ error: error.message || error });
  }
});

// 3. GET /submissions - List submissions
router.get('/', async (req: Request, res: Response) => {
  const { status, academicLevel } = req.query;

  // We need to parse auth manually if we want optional auth for this mixed endpoint.
  // Actually, we can just allow any status filtering, but only ADMINs should really see non-APPROVED.
  // Let's just implement a simple check: if status is anything other than APPROVED, we require Auth.
  
  // This is a simple workaround for the optional auth problem.
  let isAdmin = false;
  let token = req.headers.authorization?.split(' ')[1];
  if (!token && req.headers.cookie) {
    const cookies = req.headers.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);
    token = cookies['token'];
  }
  
  if (token) {
    try {
      const { verifyToken } = require('../lib/jwt');
      const decoded = verifyToken(token);
      isAdmin = decoded.role === 'ADMIN';
    } catch (e) {}
  }

  const requestedStatus = (status as string) || 'APPROVED';
  
  if (requestedStatus !== 'APPROVED' && !isAdmin) {
    return res.status(403).json({ error: 'Only admins can view non-approved submissions' });
  }

  const filter = {
    status: requestedStatus as any,
    ...(academicLevel ? { academicLevel: academicLevel as any } : {}),
  };

  try {
    const submissions = await prisma.submission.findMany({
      where: filter,
      include: {
        user: {
          select: { name: true, schoolName: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(submissions);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// 4. GET /submissions/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const submission = await prisma.submission.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { name: true, schoolName: true } }
      }
    });
    
    if (!submission) return res.status(404).json({ error: 'Not found' });
    res.json(submission);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch submission' });
  }
});

// 5. PATCH /submissions/:id/status - Moderation
router.patch('/:id/status', requireRole(['ADMIN']), async (req: Request, res: Response) => {
  const { status, reason } = req.body;
  
  if (status !== 'APPROVED' && status !== 'REJECTED') {
    return res.status(400).json({ error: 'Status must be APPROVED or REJECTED' });
  }

  try {
    const submission = await prisma.submission.update({
      where: { id: req.params.id },
      data: { status },
    });
    
    if (status === 'REJECTED') {
      console.log(`[Moderation] Submission ${submission.id} rejected. Reason: ${reason}`);
    } else if (status === 'APPROVED') {
      await sendPushNotification(
        submission.userId,
        'Submission Approved!',
        `Your submission "${submission.title}" has been approved and is now public.`,
        { url: `/read/${submission.id}` }
      );
    }

    res.json(submission);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update submission status' });
  }
});

export default router;
