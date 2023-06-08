import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Pagination } from '../../shared/decorators/pagination.decorator';
import { PaginationParam } from '../../shared/interfaces/pagination.interface';
import { EmailLoginDto } from '../user/dto/email-login.dto';
import { AdminService } from './admin.service';

@Controller('api/auth/admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('login')
  async login(@Body() body: EmailLoginDto) {
    return this.adminService.login(body);
  }

  @Get('statistic-user-register')
  async statisticUserRegister(@Query() query: any) {
    return this.adminService.statisticUserRegister(query);
  }

  @Get('users')
  async getUsers(
    @Query() query: any,
    @Pagination() pagination: PaginationParam,
  ) {
    return this.adminService.getUsers(query, pagination);
  }

  @Get('user/:id')
  async getUser(@Param('id') id: string) {
    return this.adminService.getUserDetail(id);
  }
}
