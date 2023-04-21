import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { AsyncService } from '../async/async.service';
import { IRequestConfig } from './interfaces/request-config.interface';
import { RedisLockService } from '../redis-helper/redis-lock.service';

@Injectable()
export class HttpRequestService {
  protected error: Error;
  constructor(
    protected asyncService: AsyncService,
    protected httpService: HttpService,
    protected redisLockService: RedisLockService,
  ) {}
  protected async request(
    requestConfig: IRequestConfig,
    errorCb?: (error) => any,
  ) {
    const { method, url, lockRequestTtl, useLockRequest } = requestConfig;
    if (useLockRequest) {
      await this.redisLockService.lockRequest({
        key: `${method}:${url}`,
        ttl: lockRequestTtl,
      });
    }

    try {
      const { data } = await this.asyncService.asyncRetry(async () =>
        lastValueFrom(this.httpService.request(requestConfig)),
      );
      return data;
    } catch (err) {
      this.error = err;
      if (errorCb) {
        errorCb(this.error);
      }
      throw err;
    }
  }
}
