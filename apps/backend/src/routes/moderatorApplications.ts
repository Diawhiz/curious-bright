import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/role';

const router = Router();

// POST /moderator-applications — submit application (logged-in users only)
router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { motivation, experience, subjects } = req.body;

    if (!motivation || !experience || !subjects?.length) {
      return res.status(400).json({ error: 'motivation, experience, and at least one subject are required.' });
    }

    // Only one application per user
    const existing = await prisma.moderatorApplication.findUnique({ where: { userId } });
    if (existing) {
      return res.status(409).json({
        error: 'You have already submitted a moderator application.',
        status: existing.status,
      });
    }

    const application = await prisma.moderatorApplication.create({
      data: {
        userId,
        motivation: motivation.trim(),
        experience: experience.trim(),
        subjects: Array.isArray(subjects) ? subjects : [subjects],
      },
    });

    res.status(201).json(application);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

// GET /moderator-applications/me — check own application status
router.get('/me', requireAuth, async (req: Request, res: Response) => {
  try {
    const application = await prisma.moderatorApplication.findUnique({
      where: { userId: req.user!.id },
    });
    if (!application) return res.status(404).json({ error: 'No application found' });
    res.json(application);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch application' });
  }
});

// GET /moderator-applications — list all (ADMIN only)
router.get('/', requireAuth, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const applications = await prisma.moderatorApplication.findMany({
      where: status ? { status: status as any } : undefined,
      include: {
        user: { select: { id: true, name: true, email: true, schoolName: true, createdAt: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// PATCH /moderator-applications/:id/review — approve or reject (ADMIN only)
router.patch('/:id/review', requireAuth, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, reviewNote } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'status must be APPROVED or REJECTED' });
    }

    const application = await prisma.moderatorApplication.findUnique({ where: { id } });
    if (!application) return res.status(404).json({ error: 'Application not found' });

    const updated = await prisma.moderatorApplication.update({
      where: { id },
      data: { status, reviewNote: reviewNote?.trim() || null },
    });

    // If approved, promote the user to MODERATOR
    if (status === 'APPROVED') {
      await prisma.user.update({
        where: { id: application.userId },
        data: { role: 'MODERATOR' },
      });
    }

    // Notify the user
    await prisma.notification.create({
      data: {
        userId: application.userId,
        title: status === 'APPROVED' ? '🎉 Moderator Application Approved!' : 'Moderator Application Update',
        body: status === 'APPROVED'
          ? 'Congratulations! You have been promoted to Moderator. You can now access the moderation dashboard.'
          : `Your moderator application was not approved at this time.${reviewNote ? ` Reason: ${reviewNote}` : ''}`,
      },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to review application' });
  }
});

export default router;
