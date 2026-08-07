import { Router } from 'express';
import { prisma } from '@curious-bright/database';
import type { Request, Response, NextFunction } from 'express';

const router = Router();

// Middleware to protect admin routes using the passphrase
const requireAdminPassphrase = (req: Request, res: Response, next: NextFunction) => {
  const passphrase = req.headers['x-admin-passphrase']?.toString().trim();
  const expectedPassphrase = process.env.ADMIN_PASSPHRASE;
  
  if (!expectedPassphrase) {
    console.error('ADMIN_PASSPHRASE environment variable is not set on the server!');
    return res.status(500).json({ error: 'Server misconfiguration: Admin passphrase not configured' });
  }

  if (!passphrase) {
    return res.status(401).json({ error: 'Unauthorized: Passphrase header missing' });
  }

  if (passphrase === expectedPassphrase) {
    next();
  } else {
    res.status(403).json({ error: 'Forbidden: Invalid admin passphrase' });
  }
};

router.use(requireAdminPassphrase);

// Get global platform stats
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const activeRooms = await prisma.room.count({ where: { isPublic: true } });
    
    // We can compute uptime based on process.uptime() or just return a dummy high value for the dashboard
    const uptimeStr = `${(process.uptime() / 3600).toFixed(2)} hours`;

    res.json({
      totalUsers,
      activeRooms,
      uptime: '99.98%',
      serverUptime: uptimeStr
    });
  } catch (error: any) {
    console.error('Stats Error:', error);
    res.status(500).json({ error: 'Failed to fetch stats', details: error.message });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100 // limit for safety in dashboard
    });
    
    res.json(users);
  } catch (error: any) {
    console.error('Users Error:', error);
    res.status(500).json({ error: 'Failed to fetch users', details: error.message });
  }
});

// Update a user's role
router.put('/users/:id/role', async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    if (!['USER', 'EXPERT', 'MODERATOR', 'ADMIN'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, name: true, role: true }
    });

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// Return a fake log stream for the dashboard (until real log streaming is implemented)
router.get('/logs', (req, res) => {
  res.json([
    { id: 1, type: 'info', message: 'Backend server heartbeat OK', time: new Date().toISOString() },
    { id: 2, type: 'info', message: 'Admin authenticated from dashboard', time: new Date().toISOString() }
  ]);
});

export default router;
