import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-facebook';
import { AppConfigService } from '../config.service';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: AppConfigService) {
    super({
      clientID: configService.get('facebook.clientId'),
      clientSecret: configService.get('facebook.secret'),
      callbackURL: `${configService.get('app.apiURL')}/auth/facebook/callback`,
      scope: 'email',
      profileFields: ['emails', 'name'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (err: any, user: any, info?: any) => void,
  ): Promise<any> {
    const { id, emails, name, provider } = profile;
    const payload = {
      id,
      provider,
      email: emails?.[0]?.value,
      fullName: `${name.familyName} ${name.givenName}`,
    };

    done(null, payload);
  }
}
