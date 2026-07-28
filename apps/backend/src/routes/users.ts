import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';

const router = Router();

// POST /users/:id/block
router.post('/:id/block', requireAuth, async (req, res) => {
  try {
    const blockedId = req.params.id;
    const blockerId = req.user!.id;

    if (blockerId === blockedId) {
      return res.status(400).json({ error: 'Cannot block yourself' });
    }

    const block = await prisma.userBlock.create({
      data: {
        blockerId,
        blockedId,
      },
    });

    res.status(201).json(block);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'User is already blocked' });
    }
    res.status(500).json({ error: 'Failed to block user' });
  }
});

// GET /users/blocked
router.get('/blocked', requireAuth, async (req, res) => {
  try {
    const blocks = await prisma.userBlock.findMany({
      where: { blockerId: req.user!.id },
      include: {
        blocked: { select: { id: true, name: true } }
      }
    });

    res.json(blocks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch blocked users' });
  }
});

// GET /users/notifications
router.get('/notifications', requireAuth, async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

export default router;
