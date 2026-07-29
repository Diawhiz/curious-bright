import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/role';

const router = Router();

// GET /analytics/dashboard
router.get('/dashboard', requireRole(['ADMIN', 'MODERATOR']), async (req: Request, res: Response) => {

  try {
    const [
      totalUsers,
      totalSubmissions,
      pendingSubmissions,
      totalRooms,
      activeRooms,
      totalMessages,
      pendingReports,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.submission.count(),
      prisma.submission.count({ where: { status: 'PENDING' } }),
      prisma.room.count(),
      prisma.room.count({ where: { isPublic: true } }),
      prisma.message.count(),
      prisma.report.count({ where: { status: 'PENDING' } })
    ]);

    res.json({
      totalUsers,
      totalSubmissions,
      pendingSubmissions,
      totalRooms,
      activeRooms,
      totalMessages,
      pendingReports,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

export default router;
