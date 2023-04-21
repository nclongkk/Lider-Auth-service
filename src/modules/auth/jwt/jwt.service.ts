import { Injectable } from '@nestjs/common';
import type { JwtSignOptions } from '@nestjs/jwt';
import { JwtService } from '@nestjs/jwt';

import { AppConfigService } from '../../../config/config.service';

export interface ITokenPayload {
  _id: string | null | undefined;
  email: string | null | undefined;
  fullName: string | null | undefined;
  localUserId: string | null | undefined;
  avatar: string | null | undefined;
  resetTokenCode?: string | null | undefined;
}

@Injectable()
export class AppJWTService {
  constructor(
    private jwtService: JwtService,
    private configService: AppConfigService,
  ) {}

  public async issueAccessToken(
    payload: Record<string, any>,
    options?: JwtSignOptions,
  ): Promise<string> {
    const secret = this.configService.get('auth.jwt.accessTokenSecret');
    const expiresIn = this.configService.get('auth.jwt.accessTokenLife');
    const tokenPayload = this.resolvePayload(payload);
    return this.jwtService.signAsync(tokenPayload, {
      expiresIn,
      secret,
      ...options,
    });
  }

  public async issueToken(
    payload: Record<string, any>,
  ): Promise<{ accessToken: string }> {
    const accessToken = await this.issueAccessToken(payload);
    return { accessToken };
  }

  public resolvePayload(payload: Record<string, any>): ITokenPayload {
    const tokenPayload = payload as ITokenPayload;
    const result: ITokenPayload = {
      _id: tokenPayload._id,
      email: tokenPayload.email,
      fullName: tokenPayload.fullName,
      localUserId: tokenPayload.localUserId,
      avatar: tokenPayload.avatar,
    };

    if (tokenPayload.resetTokenCode) {
      result.resetTokenCode = tokenPayload.resetTokenCode;
    }

    return result;
  }
}
