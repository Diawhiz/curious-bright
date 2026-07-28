import { Router, Request, Response } from 'express';
import { PrismaClient } from '@curious-bright/database';
import { requireAuth } from '../middleware/auth';

const prisma = new PrismaClient();
const router = Router();

// 1. POST /rooms - Create a new room
router.post('/', requireAuth, async (req: Request, res: Response) => {
  const { type, name, topic, isPublic } = req.body;
  
  try {
    const room = await prisma.room.create({
      data: {
        type,
        name,
        topic,
        isPublic: isPublic ?? true,
        members: {
          create: {
            userId: req.user!.id,
            isAdmin: true,
          }
        }
      }
    });
    res.status(201).json(room);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create room' });
  }
});

// 2. GET /rooms - List public rooms (optionally by topic)
router.get('/', async (req: Request, res: Response) => {
  const { topic } = req.query;
  
  try {
    const rooms = await prisma.room.findMany({
      where: {
        isPublic: true,
        ...(topic ? { topic: topic as string } : {})
      },
      include: {
        _count: {
          select: { members: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(rooms);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

// 3. GET /rooms/:id/members - Get list of members in a room
router.get('/:id/members', async (req: Request, res: Response) => {
  try {
    const members = await prisma.roomMember.findMany({
      where: { roomId: req.params.id },
      include: {
        user: {
          select: { id: true, name: true, schoolName: true, role: true }
        }
      },
      orderBy: { joinedAt: 'asc' }
    });
    res.json(members);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch room members' });
  }
});

// 4. POST /rooms/:id/join - Join a room
router.post('/:id/join', requireAuth, async (req: Request, res: Response) => {
  try {
    const member = await prisma.roomMember.create({
      data: {
        roomId: req.params.id,
        userId: req.user!.id,
      }
    });
    res.status(201).json(member);
  } catch (error: any) {
    // If it fails due to unique constraint, they are already a member
    res.status(400).json({ error: 'Failed to join room or already a member' });
  }
});

// 5. POST /rooms/:id/leave - Leave a room
router.post('/:id/leave', requireAuth, async (req: Request, res: Response) => {
  try {
    await prisma.roomMember.delete({
      where: {
        roomId_userId: {
          roomId: req.params.id,
          userId: req.user!.id,
        }
      }
    });
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: 'Not a member or failed to leave' });
  }
});

// 6. GET /rooms/:id/messages - Get paginated messages
router.get('/:id/messages', requireAuth, async (req: Request, res: Response) => {
  const { cursor } = req.query; // ID of the last message received
  const limit = 50;
  
  try {
    // Basic authorization: check if user is a member
    const membership = await prisma.roomMember.findUnique({
      where: {
        roomId_userId: {
          roomId: req.params.id,
          userId: req.user!.id,
        }
      }
    });
    
    if (!membership) {
      return res.status(403).json({ error: 'Must be a member to view messages' });
    }

    const messages = await prisma.message.findMany({
      where: { roomId: req.params.id },
      take: limit,
      ...(cursor ? { skip: 1, cursor: { id: cursor as string } } : {}),
      orderBy: { createdAt: 'desc' },
      include: {
        sender: {
          select: { name: true }
        }
      }
    });
    
    res.json(messages);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// 7. DELETE /rooms/:id/messages/:messageId - Moderation
router.delete('/:id/messages/:messageId', requireAuth, async (req: Request, res: Response) => {
  try {
    const isPlatformAdmin = req.user!.role === 'ADMIN' || req.user!.role === 'EXPERT';
    
    if (!isPlatformAdmin) {
      const membership = await prisma.roomMember.findUnique({
        where: { roomId_userId: { roomId: req.params.id, userId: req.user!.id } }
      });
      if (!membership || !membership.isAdmin) {
        return res.status(403).json({ error: 'Not authorized to moderate this room' });
      }
    }

    await prisma.message.delete({
      where: { id: req.params.messageId, roomId: req.params.id }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

// 8. DELETE /rooms/:id/members/:userId - Remove member
router.delete('/:id/members/:userId', requireAuth, async (req: Request, res: Response) => {
  try {
    const isPlatformAdmin = req.user!.role === 'ADMIN' || req.user!.role === 'EXPERT';
    
    if (!isPlatformAdmin) {
      const membership = await prisma.roomMember.findUnique({
        where: { roomId_userId: { roomId: req.params.id, userId: req.user!.id } }
      });
      if (!membership || !membership.isAdmin) {
        return res.status(403).json({ error: 'Not authorized to moderate this room' });
      }
    }

    await prisma.roomMember.delete({
      where: { roomId_userId: { roomId: req.params.id, userId: req.params.userId } }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove member' });
  }
});

export default router;
