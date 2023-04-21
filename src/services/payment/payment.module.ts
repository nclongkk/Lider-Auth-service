import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { PaymentApiService } from './payment-api.service';

@Global()
@Module({
  imports: [HttpModule],
  providers: [PaymentApiService],
  exports: [PaymentApiService],
})
export class PaymentModule {}
