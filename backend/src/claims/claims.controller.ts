import { Body, Controller, Get, Param, Patch, Post, UseGuards, Req, Delete } from '@nestjs/common';
import { ClaimsService } from './claims.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/roles/roles.guard';
import { Roles } from '../common/roles/roles.decorator';
import { CreateClaimDto } from './dto/create-claim.dto';
import { UpdateClaimDto } from './dto/update-claim.dto';

@Controller('claims')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClaimsController {
  constructor(private readonly claims: ClaimsService) {}

  // MEMBER files a claim
  @Post()
  @Roles('MEMBER')
  create(@Body() dto: CreateClaimDto, @Req() req: any) {
    return this.claims.create(dto, req.user);
  }

  // TRANSCOM / PROVIDER review queue
  @Get()
  @Roles('TRANSCOM', 'PROVIDER')
  listAll() {
    return this.claims.listAll();
  }

  // TRANSCOM / PROVIDER can read a single claim
  @Get(':id')
  @Roles('TRANSCOM', 'PROVIDER')
  getOne(@Param('id') id: string) {
    return this.claims.getOne(id);
  }

  // TRANSCOM / PROVIDER can change status or edit items during review workflow
  @Patch(':id')
  @Roles('TRANSCOM', 'PROVIDER')
  update(@Param('id') id: string, @Body() dto: UpdateClaimDto) {
    return this.claims.update(id, dto);
  }

  // Optional admin clean-up
  @Delete(':id')
  @Roles('TRANSCOM')
  remove(@Param('id') id: string) {
    return this.claims.remove(id);
  }
}
