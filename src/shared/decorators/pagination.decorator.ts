import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import {
  PAGINATION_DEFAULT_LIMIT,
  PAGINATION_DEFAULT_PAGE,
  PAGINATION_MAX_LIMIT,
  PAGINATION_MAX_PAGE,
  PAGINATION_MIN_LIMIT,
  PAGINATION_MIN_PAGE,
} from '../../constants/common.constants';

export const Pagination = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const queries = ctx.switchToHttp().getRequest().query;
    return {
      page: Math.min(
        Number(queries['page']) || PAGINATION_DEFAULT_PAGE,
        PAGINATION_MAX_PAGE,
      ),
      limit: Math.min(
        queries['limit'] || PAGINATION_DEFAULT_LIMIT,
        PAGINATION_MAX_LIMIT,
      ),
    };
  },
  [
    (target: any, key: string) => {
      ApiQuery({
        name: 'page',
        schema: {
          default: PAGINATION_DEFAULT_PAGE,
          type: 'number',
          minimum: PAGINATION_MIN_PAGE,
          maximum: PAGINATION_MAX_PAGE,
        },
        required: false,
      })(target, key, Object.getOwnPropertyDescriptor(target, key));
      ApiQuery({
        name: 'limit',
        schema: {
          default: PAGINATION_DEFAULT_LIMIT,
          type: 'number',
          minimum: PAGINATION_MIN_LIMIT,
          maximum: PAGINATION_MAX_LIMIT,
        },
        required: false,
      })(target, key, Object.getOwnPropertyDescriptor(target, key));
    },
  ],
);
