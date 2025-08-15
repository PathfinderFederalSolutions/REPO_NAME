import { Controller, Get, Put, Query, Body, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('policy')
  async getPolicy(
    @Query('region') region: string,
    @Query('serviceCat') serviceCat: string,
  ) {
    return this.prisma.allocationPolicy.findFirst({ where: { region, serviceCat } });
  }

  @Put('policy')
  async putPolicy(@Body() body: any) {
    const { region, serviceCat, ...data } = body || {};
    const existing = await this.prisma.allocationPolicy.findFirst({
      where: { region, serviceCat },
      select: { id: true },
    });
    if (existing) {
      return this.prisma.allocationPolicy.update({ where: { id: existing.id }, data });
    }
    return this.prisma.allocationPolicy.create({ data: { region, serviceCat, ...data } });
  }

  @Get('shares')
  async getShares(@Query('taskOrderId') taskOrderId: string) {
    return this.prisma.allocationShare.findMany({
      where: { taskOrderId },
      orderBy: { orgId: 'asc' },
    });
  }
}
