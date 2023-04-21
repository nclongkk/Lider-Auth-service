import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt/jwt.strategy';
import { AppJWTService } from './jwt/jwt.service';
import { ConfigurationModule } from '../../config/config.module';
import { AuthService } from './auth.service';
import { HelperModule } from '../../helper/helper/helper.module';
import { FacebookStrategy } from '../../config/facebook-auth/facebook.strategy';
import { SendEmailModule } from '../mail/send-email.module';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({}),
    ConfigurationModule,
    HelperModule,
    SendEmailModule,
  ],
  controllers: [AuthController],
  providers: [JwtStrategy, AppJWTService, AuthService, FacebookStrategy],
  exports: [AppJWTService, AuthService],
})
export class AuthModule {}
