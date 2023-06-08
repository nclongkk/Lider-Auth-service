import { BadRequestException, Injectable } from '@nestjs/common';
import * as moment from 'moment';
import * as bcrypt from 'bcrypt';

import { AppRepository } from '../../database/app.repository';
import { createMongoIdByTimestamp } from '../../helper';
import { PaginationParam } from '../../shared/interfaces/pagination.interface';
import { EmailLoginDto } from '../user/dto/email-login.dto';
import { AppJWTService } from '../auth/jwt/jwt.service';
import { ROLE } from '../user/constants/roles.constant';

@Injectable()
export class AdminService {
  constructor(
    private readonly appRepository: AppRepository,
    private readonly jwtService: AppJWTService,
  ) {}

  async login(emailLoginDto: EmailLoginDto) {
    const user = await this.appRepository.user.getOne({
      where: {
        email: emailLoginDto.email,
      },
      select: 'email fullName password avatar role',
    });
    console.log(user);
    if (
      !user ||
      !(await bcrypt.compare(emailLoginDto.password, user.password))
    ) {
      throw new BadRequestException('error.invalid_email_or_password');
    }

    console.log(user);

    if (user.role !== ROLE.ADMIN) {
      throw new BadRequestException('error.invalid_email_or_password');
    }
    const { accessToken } = await this.jwtService.issueToken(user);

    return {
      accessToken,
    };
  }

  async statisticUserRegister(query: any) {
    const where: any = {};
    if (!query.from) {
      query.from = moment.utc().subtract(7, 'days').format('YYYY-MM-DD');
    }
    if (!query.to) {
      query.to = moment.utc().format('YYYY-MM-DD');
    }
    let format: '%Y-%m-%d' | '%Y-%m' | '%Y' = '%Y-%m-%d';
    if (moment.utc(query.to).diff(moment.utc(query.from), 'days') > 365) {
      format = '%Y';
    }
    if (moment.utc(query.to).diff(moment.utc(query.from), 'days') > 45) {
      format = '%Y-%m';
    }

    if (query.from) {
      where._id = {
        $gte: createMongoIdByTimestamp(
          moment.utc(query.from).startOf('day').valueOf() / 1000,
          'from-time',
        ),
      };
    }
    if (query.to) {
      where._id = {
        ...where._id,
        $lte: createMongoIdByTimestamp(
          moment.utc(query.to).endOf('day').valueOf() / 1000,
          'to-time',
        ),
      };
    }

    const result = await this.appRepository.user.aggregate([
      {
        $match: where,
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format,
              date: '$createdAt',
            },
          },
          count: {
            $sum: 1,
          },
        },
      },
    ]);

    return result;
  }

  async getUsers(query: any, { limit, page }: PaginationParam) {
    const where: any = {};
    if (query.from) {
      where._id = {
        $gte: createMongoIdByTimestamp(
          moment.utc(query.from).startOf('day').valueOf() / 1000,
          'from-time',
        ),
      };
    }
    if (query.to) {
      where._id = {
        ...where._id,
        $lte: createMongoIdByTimestamp(
          moment.utc(query.to).endOf('day').valueOf() / 1000,
          'to-time',
        ),
      };
    }

    return this.appRepository.user.getAllWithPaging({
      where,
      limit,
      page,
    });
  }

  getUserDetail(id) {
    return this.appRepository.user.getOne({
      where: { _id: id },
      select: '-password',
    });
  }
}
