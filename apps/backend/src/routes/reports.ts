import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { reportLimiter } from '../middleware/rateLimiter';

const router = Router();

// POST /reports
router.post('/', requireAuth, reportLimiter, async (req: Request, res: Response) => {

  try {
    const { targetType, targetId, reason } = req.body;
    
    if (!['ROOM', 'MESSAGE', 'USER'].includes(targetType)) {
      return res.status(400).json({ error: 'Invalid target type' });
    }
    
    const report = await prisma.report.create({
      data: {
        targetType,
        targetId,
        reason,
        reporterId: req.user!.id,
      },
    });

    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit report' });
  }
});

// GET /reports (Admin dashboard)
router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    // Only admins/moderators can view all reports
    if (req.user!.role !== 'ADMIN' && req.user!.role !== 'MODERATOR') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const reports = await prisma.report.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        reporter: { select: { id: true, name: true, email: true } },
      }
    });

    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// PATCH /reports/:id (Admin resolve)
router.patch('/:id', requireAuth, async (req: Request, res: Response) => {

  try {
    if (req.user!.role !== 'ADMIN' && req.user!.role !== 'MODERATOR') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { status } = req.body;
    const report = await prisma.report.update({
      where: { id: req.params.id },
      data: { status },
    });

    res.json(report);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update report' });
  }
});

export default router;
