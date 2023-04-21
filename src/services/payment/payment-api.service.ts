import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AppConfigService } from '../../config/config.service';
import { User } from '../../database/schemas';
import { AsyncService } from '../../helper/async/async.service';
import { HttpRequestService } from '../../helper/http-request/http-request.service';
import { RedisLockService } from '../../helper/redis-helper/redis-lock.service';
import { AppLoggerService } from '../../logger/logger.service';

@Injectable()
export class PaymentApiService extends HttpRequestService {
  constructor(
    protected readonly httpService: HttpService,
    protected readonly asyncService: AsyncService,
    protected readonly redisLockService: RedisLockService,
    private readonly configService: AppConfigService,
    private readonly logger: AppLoggerService,
  ) {
    super(asyncService, httpService, redisLockService);
  }

  async createPaymentCustomer(user: User) {
    this.request(
      {
        url:
          this.configService.get('services.payment.url') +
          '/stripe/create-customer',
        method: 'POST',
        data: {
          email: user.email,
          _id: user._id,
        },
      },
      (error) => {
        this.logger.error({
          error: new Error('Call API createPaymentCustomer failed'),
          msg: 'Call API createPaymentCustomer failed',
          log: {
            user,
            error,
          },
        });
      },
    );
  }
}
