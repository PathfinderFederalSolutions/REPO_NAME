import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { CreateMoveDto, UpdateMoveDto, Move } from './dto';
import { randomUUID } from 'crypto';

@Injectable()
export class MovesService {
  private moves: Move[] = [];

  listForUser(user: any): Move[] {
    if (user.role === 'TRANSCOM') return this.moves;
    if (user.role === 'PROVIDER') return this.moves.filter(m => m.providerId === (user.companyId || user.id));
    if (user.role === 'MEMBER') return this.moves.filter(m => m.memberId === user.id);
    return [];
  }

  getOneForUser(id: string, user: any): Move {
    const move = this.moves.find(m => m.id === id);
    if (!move) throw new NotFoundException('Move not found');
    if (user.role === 'TRANSCOM') return move;
    if (user.role === 'PROVIDER' && move.providerId === (user.companyId || user.id)) return move;
    if (user.role === 'MEMBER' && move.memberId === user.id) return move;
    throw new ForbiddenException();
  }

  create(dto: CreateMoveDto): Move {
    const now = new Date().toISOString();
    const move: Move = { id: randomUUID(), status: 'NEW', createdAt: now, updatedAt: now, ...dto };
    this.moves.push(move);
    return move;
  }

  update(id: string, dto: UpdateMoveDto, user: any): Move {
    const idx = this.moves.findIndex(m => m.id === id);
    if (idx === -1) throw new NotFoundException('Move not found');
    const move = this.moves[idx];

    if (dto.providerId && user.role !== 'TRANSCOM') {
      throw new ForbiddenException('Only TRANSCOM can assign provider');
    }
    if (user.role === 'PROVIDER' && move.providerId && move.providerId !== (user.companyId || user.id)) {
      throw new ForbiddenException('Not your job');
    }

    const updated = { ...move, ...dto, updatedAt: new Date().toISOString() };
    this.moves[idx] = updated;
    return updated;
  }

  remove(id: string): void {
    this.moves = this.moves.filter(m => m.id !== id);
  }
}
