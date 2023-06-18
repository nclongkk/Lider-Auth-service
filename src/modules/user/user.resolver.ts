import { UseGuards } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';

import { User } from '../../database/schemas';
import { GqlCurrentUser } from '../../shared/decorators/gql-user.decorator';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { UserService } from './user.service';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}
  @UseGuards(JwtAuthGuard)
  @Query(() => User)
  async user(@GqlCurrentUser() currentUser) {
    return currentUser;
  }

  @Query(() => User)
  async userById(@Args('id') id: string) {
    return this.userService.getUserById(id);
  }
}
