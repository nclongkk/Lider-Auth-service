import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AppConfigService } from '../../config/config.service';
import { User } from '../../database/schemas';
import { AsyncService } from '../../helper/async/async.service';
import { HttpRequestService } from '../../helper/http-request/http-request.service';
import { RedisLockService } from '../../helper/redis-helper/redis-lock.service';
import { AppLoggerService } from '../../logger/logger.service';

@Injectable()
export class AppApiService extends HttpRequestService {
  constructor(
    protected readonly httpService: HttpService,
    protected readonly asyncService: AsyncService,
    protected readonly redisLockService: RedisLockService,
    private readonly configService: AppConfigService,
    private readonly logger: AppLoggerService,
  ) {
    super(asyncService, httpService, redisLockService);
  }

  async createAppCustomer(user: User) {
    this.request(
      {
        url: this.configService.get('services.app.url') + '/users-internal',
        method: 'POST',
        data: {
          userId: user._id,
        },
      },
      (error) => {
        this.logger.error({
          error: new Error('Call API Create App failed'),
          msg: 'Call API Create APp failed',
          log: {
            user,
            error,
          },
        });
      },
    );
  }
}
