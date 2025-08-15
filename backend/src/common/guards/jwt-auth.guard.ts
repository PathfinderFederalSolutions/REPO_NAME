import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    const header = String(req.headers['authorization'] || '');
    if (!header.startsWith('Bearer ')) throw new UnauthorizedException('Missing token');
    const token = header.slice(7);
    const secret = process.env.JWT_SECRET || 'dev_secret';
    try {
      const payload = jwt.verify(token, secret) as any;
      req.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
