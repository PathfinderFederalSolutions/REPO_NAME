import { Controller, Get, Headers } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Controller('auth')
export class AuthController {
  @Get('me')
  me(@Headers('authorization') auth?: string) {
    if (!auth || !auth.startsWith('Bearer ')) {
      return { ok: false, error: 'Missing or invalid Authorization header' };
    }
    const token = auth.slice('Bearer '.length);
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev') as any;
      // Return only what the frontend needs
      return { id: payload.id, email: payload.email, role: payload.role };
    } catch (e) {
      return { ok: false, error: 'Invalid token' };
    }
  }
}
