import type { INestApplication } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import basicAuth from 'express-basic-auth';

import { AppConfigService } from '../config.service';

@Injectable()
export class SwaggerConfig {
  constructor(private configService: AppConfigService) {}

  public setupSwagger(app: INestApplication): void {
    if (this.configService.get('swagger.mode') === 'on') {
      // const swaggerUsername = this.configService.get('swagger.username');
      // const swaggerPassword = this.configService.get('swagger.password');
      // app.use(
      //   ['/api/auth/v1/doc', '/api/auth/v1/doc-json'],
      //   basicAuth({
      //     challenge: false,
      //     users: {
      //       [swaggerUsername]: swaggerPassword,
      //     },
      //   }),
      // );

      const config = new DocumentBuilder()
        .setTitle('Ecomdy Project API')
        .setDescription('The Ecomdy project APIs description')
        .setVersion('2.0')
        .addBearerAuth()
        .build();

      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('/api/auth/v1/doc', app, document, {
        swaggerOptions: { filter: true },
      });
    }
  }
}
