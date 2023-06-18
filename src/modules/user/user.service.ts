import { Injectable } from '@nestjs/common';

import { BaseService } from './../../base/base.service';
import { UserDocument } from '../../database/schemas';
import { AppRepository } from '../../database/app.repository';

@Injectable()
export class UserService extends BaseService<UserDocument> {
  constructor(private readonly appRepository: AppRepository) {
    super(appRepository.user);
  }

  getUserById(id: string) {
    return this.appRepository.user.getOne({
      where: { _id: id },
    });
  }
}
