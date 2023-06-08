import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { User } from '../../database/schemas';

export const GqlCurrentUser = createParamDecorator<
  unknown,
  ExecutionContext,
  User
>((_, context) => {
  const ctx = GqlExecutionContext.create(context);
  return ctx.getContext().req.user;
});
