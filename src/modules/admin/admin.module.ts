import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AppJWTService } from '../auth/jwt/jwt.service';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [JwtModule.register({})],
  controllers: [AdminController],
  providers: [AdminService, AppJWTService],
  exports: [],
})
export class AdminModule {}
