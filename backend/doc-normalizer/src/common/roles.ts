import { Request, Response, NextFunction } from 'express';
export type Role = 'USTRANSCOM' | 'MEMBER' | 'PROVIDER' | 'PRIME';

export function requireRole(allowed: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const role = (req.header('x-role') || '').toUpperCase() as Role;
    if (!allowed.includes(role)) {
      return res.status(403).json({ error: 'Forbidden: role not allowed', role });
    }
    (req as any).role = role; // attach for downstream handlers
    next();
  };
}
