import { MongooseModule } from '@nestjs/mongoose';
import { Global, Module } from '@nestjs/common';

import * as schema from './schemas';
import { AppRepository } from './app.repository';
import * as repo from './repositories';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: schema.UserSchema, collection: 'users' },
    ]),
  ],
  exports: [AppRepository],
  providers: [...Object.values(repo), AppRepository],
})
export class AppRepositoryModule {}
