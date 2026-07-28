import { Request, Response, NextFunction } from 'express';
import { requireAuth } from './auth';

export const requireRole = (allowedRoles: string[]) => {
  return [
    requireAuth,
    (req: Request, res: Response, next: NextFunction) => {
      if (!req.user || !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      next();
    }
  ];
};
