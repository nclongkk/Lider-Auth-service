import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { NODE_ENV } from '../../../constants';
import { AppConfigService } from '../../../config/config.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: AppConfigService) {
    const secretOrKey = configService.get('auth.jwt.accessTokenSecret');
    const env = configService.get('app.env');
    super({
      ignoreExpiration: env === NODE_ENV.DEV,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey,
    });
  }

  public validate(payload: any): any {
    return payload;
  }
}
