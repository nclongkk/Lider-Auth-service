import {
  ContextType,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import { fieldsProjection } from 'graphql-fields-list';

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

  async canActivate(context: ExecutionContext) {
    const can = (await super.canActivate(context)) as boolean;
    if (!can) return false;

    const request = this.getRequest(context);

    const decoded = request.user;

    const query: any = {
      where: { _id: decoded._id },
    };

    if (this.isGraphqlRequest(context)) {
      const selectFields = fieldsProjection(
        GqlExecutionContext.create(context).getInfo(),
      );
      query.select = selectFields;
    } else {
      query.select =
        'email fullName status role createdAt updatedAt avatar resetTokenCode shopify.activeStoreId localUserId';
    }
    const user = await this.appRepository.user.getOne(query);

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

  getRequest(context: ExecutionContext) {
    if (this.isGraphqlRequest(context)) {
      return GqlExecutionContext.create(context).getContext().req;
    }
    return context.switchToHttp().getRequest();
  }

  isGraphqlRequest(context: ExecutionContext) {
    return context.getType<ContextType | 'graphql'>() === 'graphql';
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
