import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { MovesService } from './moves.service';
import { CreateMoveDto, UpdateMoveDto } from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/roles/roles.guard';
import { Roles } from '../common/roles/roles.decorator';

@Controller('moves')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MovesController {
  constructor(private readonly moves: MovesService) {}

  @Get()
  list(@Req() req: any) {
    return this.moves.listForUser(req.user);
  }

  @Get(':id')
  one(@Param('id') id: string, @Req() req: any) {
    return this.moves.getOneForUser(id, req.user);
  }

  @Post()
  @Roles('TRANSCOM')
  create(@Body() dto: CreateMoveDto) {
    return this.moves.create(dto);
  }

  @Patch(':id')
  @Roles('TRANSCOM', 'PROVIDER')
  update(@Param('id') id: string, @Body() dto: UpdateMoveDto, @Req() req: any) {
    return this.moves.update(id, dto, req.user);
  }

  @Delete(':id')
  @Roles('TRANSCOM')
  delete(@Param('id') id: string) {
    this.moves.remove(id);
    return { ok: true };
  }
}
