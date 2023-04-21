import { PassportStrategy } from '@nestjs/passport';
import * as _ from 'lodash';
import { Injectable } from '@nestjs/common';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';

import { AppConfigService } from '../config.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: AppConfigService) {
    super({
      clientID: configService.get('google.clientId'),
      clientSecret: configService.get('google.secret'),
      callbackURL: `${configService.get('app.apiURL')}/auth/google/callback`,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, photos } = profile;
    const user = {
      email: _.get(emails, '[0].value'),
      firstName: name.givenName,
      lastName: name.familyName,
      picture: photos[0].value,
      accessToken,
    };
    done(null, user);
  }
}
