import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { AppApiService } from './app-api.service';

@Global()
@Module({
  imports: [HttpModule],
  controllers: [],
  providers: [AppApiService],
  exports: [AppApiService],
})
export class AppApiModule {}
