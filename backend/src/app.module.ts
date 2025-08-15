import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AdminModule } from './admin/admin.module';
import { MovesModule } from './moves/moves.module';
import { ClaimsModule } from './claims/claims.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MovesModule,
    AdminModule,
    ClaimsModule,
  ],
})
export class AppModule {}