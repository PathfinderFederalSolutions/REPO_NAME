import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClaimDto } from './dto/create-claim.dto';
import { UpdateClaimDto } from './dto/update-claim.dto';

@Injectable()
export class ClaimsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateClaimDto, user: any) {
    // filedAt defaults to "now" in service
    return this.prisma.claim.create({
      data: {
        moveId: dto.moveId,
        filedAt: new Date(),
        // Persist array/object as JSON string
        items: JSON.stringify(dto.items ?? []),
        // status default is FILED via schema default
      },
    });
  }

  async listAll() {
    // For TRANSCOM/PROVIDER
    const claims = await this.prisma.claim.findMany({
      orderBy: { filedAt: 'desc' },
    });
    // Parse JSON string for convenience
    return claims.map((c) => ({
      ...c,
      items: this.safeParse(c.items),
    }));
  }

  async getOne(id: string) {
    const c = await this.prisma.claim.findUnique({ where: { id } });
    if (!c) return null;
    return { ...c, items: this.safeParse(c.items) };
  }

  async update(id: string, dto: UpdateClaimDto) {
    const updates: any = {};
    if (dto.status) updates.status = dto.status;
    if (typeof dto.items !== 'undefined') {
      updates.items = JSON.stringify(dto.items ?? []);
    }
    const c = await this.prisma.claim.update({
      where: { id },
      data: updates,
    });
    return { ...c, items: this.safeParse(c.items) };
  }

  async remove(id: string) {
    await this.prisma.claim.delete({ where: { id } });
    return { ok: true };
  }

  private safeParse(s: string) {
    try { return JSON.parse(s); } catch { return s; }
  }
}
