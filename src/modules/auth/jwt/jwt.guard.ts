import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { AppRepository } from '../../../database/app.repository';
import { AuthService } from '../auth.service';
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly appRepository: AppRepository,
    private readonly authService: AuthService,
  ) {
    super();
  }

  async canActivate(context) {
    const can = (await super.canActivate(context)) as boolean;
    if (!can) return false;

    const request = context.switchToHttp().getRequest();
    const decoded = request.user;

    const user = await this.appRepository.user.getOne({
      where: {
        _id: decoded._id,
      },
      select:
        'email fullName status role createdAt updatedAt avatar resetTokenCode',
    });
    if (!user) {
      throw new UnauthorizedException();
    }

    if (
      this.authService.hasRestrictedToken(
        decoded.resetTokenCode,
        user.resetTokenCode,
      )
    ) {
      throw new UnauthorizedException({ i18nKey: 'error.token_restricted' });
    }

    request.user = {
      ...decoded,
      ...user,
    };

    return true;
  }

  handleRequest(err, user, info) {
    if (info?.name === 'TokenExpiredError') {
      throw new UnauthorizedException('error.token_expired');
    }

    if (err || !user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
