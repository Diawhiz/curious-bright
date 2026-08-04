import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { RegisterSchema, LoginSchema } from '@curious-bright/validation';
import { signToken, verifyToken } from '../lib/jwt';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { authLoginLimiter, authRegisterLimiter } from '../middleware/rateLimiter';

const router = Router();
const isProd = process.env.NODE_ENV === 'production';

// Helper to set cookie
const setTokenCookie = (res: Response, token: string) => {
  res.cookie('token', token, {
    httpOnly: false, // Allow client-side JS to read token for Realtime Gateway Socket.IO
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

router.post('/register', authRegisterLimiter, async (req: Request, res: Response) => {
  try {
    const data = RegisterSchema.parse(req.body);
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name,
        schoolName: data.schoolName,
        role: 'USER',
      },
    });

    const token = signToken({ id: user.id, role: user.role });
    setTokenCookie(res, token);

    return res.status(201).json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role, schoolName: user.schoolName }
    });
  } catch (error: any) {
    if (error?.errors) {
      const messages = error.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ');
      return res.status(400).json({ error: messages });
    }
    return res.status(400).json({ error: error.message || 'Registration failed' });
  }
});

router.post('/login', authLoginLimiter, async (req: Request, res: Response) => {
  try {
    const data = LoginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = signToken({ id: user.id, role: user.role });
    setTokenCookie(res, token);

    return res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role, schoolName: user.schoolName }
    });
  } catch (error: any) {
    return res.status(400).json({ error: error.message || error });
  }
});

router.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('token', { path: '/' });
  return res.json({ message: 'Logged out successfully' });
});

// GET /auth/me - Return current user profile
router.get('/me', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, email: true, name: true, role: true, schoolName: true }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

export default router;
