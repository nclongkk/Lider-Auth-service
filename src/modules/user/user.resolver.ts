import { UseGuards } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';

import { User } from '../../database/schemas';
import { GqlCurrentUser } from '../../shared/decorators/gql-user.decorator';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';

@Resolver(() => User)
export class UserResolver {
  @UseGuards(JwtAuthGuard)
  @Query(() => User)
  async user(@GqlCurrentUser() currentUser) {
    return currentUser;
  }
}
