import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { EmailLoginDto } from './../user/dto/email-login.dto';
import { JwtAuthGuard } from './jwt/jwt.guard';
import { RegisterEmailDto } from './dto/register-email.dto';
import { AuthService } from './auth.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AppConfigService } from '../../config/config.service';

@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: AppConfigService,
  ) {}

  @Post('/register')
  @Throttle(10, 5)
  async register(@Req() req, @Body() registerEmailDto: RegisterEmailDto) {
    return this.authService.register(req, registerEmailDto);
  }

  @Get('/confirm')
  @ApiQuery({ name: 'hash', type: String, required: true })
  async confirmAccount(@Req() req, @Res() res, @Query('hash') hash: string) {
    const { redirectUrl } = await this.authService.confirm(req, hash);
    return res.redirect(redirectUrl);
  }

  @Post('/login')
  async login(@Req() req, @Body() emailLoginDto: EmailLoginDto): Promise<any> {
    return this.authService.login(req, emailLoginDto);
  }

  @Patch('/change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Req() req,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(req, changePasswordDto);
  }

  @Post('/forgot-password')
  @Throttle(10, 5)
  async forgotPassword(@Req() req, @Body() forgotPassword: ForgotPasswordDto) {
    return this.authService.forgotPassword(req, forgotPassword);
  }

  @Post('/reset-password')
  @Throttle(10, 5)
  async resetPassword(@Req() req, @Body() resetPassword: ResetPasswordDto) {
    return this.authService.resetPassword(req, resetPassword);
  }

  @Get('/google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {
    return;
  }

  @Get('/google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res) {
    const { accessToken, error } = await this.authService.handleLoginGoogle(
      req,
    );
    if (accessToken) {
      res.cookie('accessToken', accessToken);
    }

    let redirectUrl = this.configService.get('client.clientHomePage');
    if (error) {
      redirectUrl += `?error=${error}`;
    }

    return res.redirect(redirectUrl);
  }

  @Get('/facebook')
  @UseGuards(AuthGuard('facebook'))
  async facebookLogin(): Promise<any> {
    return;
  }

  @Get('/facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  async facebookLoginRedirect(@Req() req, @Res() res) {
    const { accessToken, error } = await this.authService.handleLoginFacebook(
      req,
    );
    if (accessToken) {
      res.cookie('accessToken', accessToken);
    }

    let redirectUrl = this.configService.get('client.clientHomePage');
    if (error) {
      redirectUrl += `?error=${error}`;
    }
    return res.redirect(redirectUrl);
  }

  @Get('/verify-token')
  @UseGuards(JwtAuthGuard)
  async verifyToken(@Req() req) {
    return req.user;
  }
}
