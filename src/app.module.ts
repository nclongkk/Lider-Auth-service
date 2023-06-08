import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { AppRepositoryModule } from './database/app-repository.module';
import { Module } from '@nestjs/common';
import { ConfigurationModule } from './config/config.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SwaggerConfig } from './config/swagger/swagger.config';
import { LoggerConfigModule } from './config/logger/logger.module';
import { I18nConfigModule } from './config/i18n/i18n.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MongooseConfigService } from './config/database/mongoose.config';
import { AsyncModule } from './helper/async/async.module';
import { RedisHelperModule } from './helper/redis-helper/redis-helper.module';
import { GoogleStrategy } from './config/google-auth/google.strategy';
import { PaymentModule } from './services/payment/payment.module';
import { SendEmailModule } from './modules/mail/send-email.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLConfigService } from './config/graphql/graphql.config';
import { AppApiModule } from './services/app/app-api.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      useClass: GraphQLConfigService,
    }),
    ConfigurationModule,
    LoggerConfigModule,
    I18nConfigModule,
    MongooseModule.forRootAsync({
      useClass: MongooseConfigService,
    }),
    AppRepositoryModule,
    AsyncModule,
    RedisHelperModule,
    PaymentModule,
    AppApiModule,

    AuthModule,
    UserModule,
    SendEmailModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService, SwaggerConfig, GoogleStrategy],
})
export class AppModule {}
