import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as _ from 'lodash';
import * as bcrypt from 'bcrypt';

import { RedisHelperService } from '../../helper/redis-helper/redis-helper.service';
import { AppRepository } from '../../database/app.repository';
import { AppJWTService } from './jwt/jwt.service';
import { AppConfigService } from '../../config/config.service';
import { HelperService } from '../../helper/helper/helper.service';
import { RegisterEmailDto } from './dto/register-email.dto';
import { AppLoggerService } from '../../logger/logger.service';
import { SignupTracking, User } from '../../database/schemas';
import { EmailLoginDto } from '../user/dto/email-login.dto';
import { errorNotFoundMsg } from '../../i18n/i18n.helper';
import { RedisLockService } from '../../helper/redis-helper/redis-lock.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { PaymentApiService } from '../../services/payment/payment-api.service';
import { SendEmailService } from '../mail/send-email.service';
import { MAIL_TEMPLATES } from '../mail/constants/mail.constants';
import { AppApiService } from '../../services/app/app-api.service';
@Injectable()
export class AuthService {
  constructor(
    private readonly redisHelper: RedisHelperService,
    private readonly helperService: HelperService,
    private readonly appRepository: AppRepository,
    private readonly jwtService: AppJWTService,
    private readonly configService: AppConfigService,
    private readonly logger: AppLoggerService,
    private readonly redisLock: RedisLockService,
    private readonly paymentApiService: PaymentApiService,
    private readonly sendEmailService: SendEmailService,
    private readonly appApiService: AppApiService,
  ) {}

  async buildCacheUserInRedis(cacheUser): Promise<any> {
    const email = cacheUser.email;
    const verificationInCache = await this.redisHelper.getKey(email);
    if (verificationInCache) {
      return verificationInCache;
    }

    const uuid = uuidv4();
    const hash = Buffer.from(
      JSON.stringify({
        uuid,
        email,
      }),
    ).toString('base64');

    return {
      hash,
      user: cacheUser,
    };
  }

  async register(req, registerEmailDto: RegisterEmailDto) {
    const { email } = registerEmailDto;
    const user = await this.appRepository.user.getOne({
      where: { email },
    });
    if (user) {
      throw new BadRequestException('error.email_already_exists');
    }

    const cacheData = registerEmailDto;
    const userInRedis = await this.buildCacheUserInRedis(cacheData);
    const ttlTime = 60 * 10;

    await this.redisHelper.setKey(email, userInRedis, ttlTime);
    try {
      await this.sendEmailService.sendEmail({
        to: email,
        template: MAIL_TEMPLATES.VERIFY_EMAIL,
        data: {
          fullName: registerEmailDto.fullName,
          confirmationLink:
            this.configService.get('app.apiURL') +
            '/auth/confirm/' +
            `?hash=${userInRedis.hash}`,
        },
        subject: 'Verify your email',
      });

      return {
        email: registerEmailDto.email,
        ttl: ttlTime,
      };
    } catch (error) {
      throw new InternalServerErrorException('error.cant_send_active_mail');
    }
  }

  async confirm(req, hash): Promise<{ redirectUrl: string }> {
    try {
      const payload = JSON.parse(Buffer.from(hash, 'base64').toString());
      const email = payload.email;
      const userCacheInRedis = await this.redisHelper.getKey(email);

      await this.redisLock.lockRequest({
        key: `${email}/confirmAccount`,
        req,
      });

      if (!userCacheInRedis || userCacheInRedis.hash !== hash) {
        throw new BadRequestException({
          i18nKey: 'error.cant_not_do_verify_account',
        });
      }
      const user = await this.appRepository.user.getOne({
        where: { email },
      });
      if (user) {
        throw new BadRequestException({
          i18nKey: 'error.email_already_exists',
        });
      }
      await this.registerNewUser(req, userCacheInRedis.user);
      this.redisHelper.deleteKey(email);

      return {
        redirectUrl: this.configService.get('client.activeAccountRedirectUrl'),
      };
    } catch (e) {
      return {
        redirectUrl: this.configService.get('client.expireSessionRedirectUrl'),
      };
    }
  }

  async registerNewUser(req, registerUser): Promise<User> {
    if (!registerUser.password) {
      registerUser.password = this.helperService.generatePassword();
    }

    _.set(
      registerUser,
      'password',
      await bcrypt.hash(
        registerUser.password,
        this.configService.get('bcrypt.saltOrRounds'),
      ),
    );
    const { ip, countryCode, countryName, provider, userAgent } =
      await this.detectUserCountryRegionIp(req);

    const signupTracking: SignupTracking = {
      ip,
      trackingAt: new Date(),
      provider,
      userAgent,
    };
    if (countryCode) {
      signupTracking.countryName = countryName;
      signupTracking.countryCode = countryCode;
      _.set(registerUser, 'country', countryName);
    }
    _.set(registerUser, 'signupTracking', signupTracking);

    const newUser = await this.appRepository.user.createOne({
      data: registerUser,
    });

    // Inform create user
    this.paymentApiService.createPaymentCustomer(newUser);
    this.appApiService.createAppCustomer(newUser);
    return newUser;
  }

  async detectUserCountryRegionIp(req: any) {
    try {
      const userAgent = req.get('user-agent');
      let ip =
        _.get(req, 'ipAddress') ||
        _.get(req, 'headers.x-forwarded-for') ||
        _.get(req, 'connection.remoteAddress');
      ip = ((ip || '') as string).split(',')[0];
      const {
        country: countryCode,
        provider,
        countryName,
      } = await this.helperService.getCountryFromIp(req, ip);
      if (!countryCode || !countryName) {
        this.logger.warn({
          msg: 'Unknown on detecting country from IP',
          log: {
            req,
            ip,
          },
        });

        return {};
      }

      return {
        ip,
        countryCode,
        countryName,
        provider,
        userAgent,
      };
    } catch (error) {
      this.logger.error({
        error,
        msg: 'Error on detecting country from IP',
      });
      return {};
    }
  }

  async login(req, emailLoginDto: EmailLoginDto) {
    const user = await this.appRepository.user.getOne({
      where: {
        email: emailLoginDto.email,
      },
      select: 'email fullName password avatar',
    });

    if (
      !user ||
      !(await bcrypt.compare(emailLoginDto.password, user.password))
    ) {
      throw new BadRequestException('error.invalid_email_or_password');
    }
    await this.handleUserLogin(req, user);
    const { accessToken } = await this.jwtService.issueToken(user);

    return {
      accessToken,
    };
  }

  async handleUserLogin(req, user: User): Promise<User> {
    const updateUser: any = {};
    _.set(updateUser, '$set.lastActive', new Date());

    const shouldRefillUser =
      !_.has(user, 'signupTracking.countryName') ||
      !_.has(user, 'signupTracking.countryCode') ||
      !_.has(user, 'signupTracking.ip');

    if (shouldRefillUser) {
      const { ip, countryCode, countryName, provider, userAgent } =
        await this.detectUserCountryRegionIp(req);

      const currentSignupTracking = user.signupTracking;
      if (
        !currentSignupTracking?.ip ||
        !currentSignupTracking?.countryName ||
        !currentSignupTracking?.countryCode
      ) {
        _.set(updateUser, '$set.signupTracking', {
          ip,
          trackingAt: new Date(),
          provider,
          countryName,
          countryCode,
          userAgent,
        });
      }
    }

    const updatedUser = await this.appRepository.user.findOneAndUpdate({
      where: {
        _id: user._id,
      },
      data: updateUser,
      options: {
        new: true,
      },
    });

    return updatedUser;
  }

  hasRestrictedToken(checkingCode, currentCode) {
    return currentCode && checkingCode !== currentCode;
  }

  async changePassword(req, changePasswordDto: ChangePasswordDto) {
    const user = await this.appRepository.user.getOne({
      where: {
        _id: req.user._id,
      },
      select: 'password',
    });
    if (!user) {
      throw new NotFoundException(errorNotFoundMsg('User'));
    }

    const isMatchPassword = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );

    if (!isMatchPassword) {
      throw new BadRequestException('error.invalid_current_password');
    }

    const hashNewPassword = await bcrypt.hash(
      changePasswordDto.newPassword,
      this.configService.get('bcrypt.saltOrRounds'),
    );
    await this.appRepository.user.updateOne({
      where: {
        _id: user._id,
      },
      data: {
        $set: {
          password: hashNewPassword,
          resetTokenCode: uuidv4(),
        },
      },
    });
  }

  async forgotPassword(req, { email }: ForgotPasswordDto) {
    const user = await this.appRepository.user.getOne({
      where: {
        email,
      },
      select: 'email fullName',
    });
    if (!user) {
      throw new NotFoundException(errorNotFoundMsg('User'));
    }

    const forgotPasswordSessionCache = await this.cacheForgotPassowrdSession(
      user.email,
    );

    const link = `${this.configService.get('client.resetPasswordUrl')}?hash=${
      forgotPasswordSessionCache.hash
    }`;
    await this.sendEmailService.sendEmail({
      to: email,
      subject: 'Reset password',
      data: {
        fullName: user.fullName,
        resetPasswordLink: link,
      },
      template: MAIL_TEMPLATES.RESET_PASSWORD,
    });

    return {
      email,
      ttl: 60 * 10,
    };
  }

  async cacheForgotPassowrdSession(email: string): Promise<any> {
    const sessionKey = `forgotPassword/${email}`;
    const cachedPayload = await this.redisHelper.getKey(sessionKey);
    if (cachedPayload) {
      return cachedPayload;
    }

    const uuid = uuidv4();
    const hash = Buffer.from(
      JSON.stringify({
        uuid,
        email,
      }),
    ).toString('base64');

    const payload = {
      hash,
    };
    await this.redisHelper.setKey(sessionKey, payload, 60 * 10);

    return payload;
  }

  async resetPassword(req, { hash, newPassword }: ResetPasswordDto) {
    const { email, uuid } = JSON.parse(Buffer.from(hash, 'base64').toString());

    const cacheKey = `forgotPassword/${email}`;
    const cachedSession = await this.redisHelper.getKey(cacheKey);

    if (!cachedSession || hash !== cachedSession.hash) {
      throw new BadRequestException('error.invalid_request');
    }
    await this.updateResetPassword(email, newPassword, uuid);

    await this.redisHelper.deleteKey(cacheKey);
  }

  async updateResetPassword(email, newPassword, resetPassCode) {
    const hashPassword = await bcrypt.hash(
      newPassword,
      this.configService.get('bcrypt.saltOrRounds'),
    );
    await this.appRepository.user.findOneAndUpdate({
      where: { email },
      data: {
        $set: {
          resetPassCode,
          password: hashPassword,
        },
      },
    });
  }

  async handleLoginGoogle(
    req,
  ): Promise<{ accessToken?: string; error?: string }> {
    if (!req.user) {
      return { error: 'Something went wrong!' };
    }

    const { email, firstName, lastName } = req.user;
    const user = await this.appRepository.user.getOne({
      where: { email: email.toLowerCase() },
    });

    if (user) {
      await this.handleUserLogin(req, user);
      return this.jwtService.issueToken(user);
    }

    const userData = {
      email: email.toLowerCase(),
      fullName: `${firstName} ${lastName}`,
      avatar: req.user.picture,
    };

    const newUser = await this.registerNewUser(req, userData);
    return this.jwtService.issueToken(newUser);
  }

  async handleLoginFacebook(
    req,
  ): Promise<{ accessToken?: string; error?: string }> {
    if (!req.user) {
      return { error: 'Something went wrong!' };
    }
    const { email, fullName, id } = req.user;
    const userEmail = email.toLowerCase().trim();
    const user = await this.appRepository.user.getOne({
      where: { email: userEmail },
    });

    if (user) {
      if (!user.fbId) {
        return {
          error:
            'The email already registered in system. Please login via email and password',
        };
      }

      if (user.fbId !== id) {
        return {
          error:
            'The facebook account id did not match. Please contact us for more information',
        };
      }

      await this.handleUserLogin(req, user);
      return this.jwtService.issueToken(user);
    }

    const userData = {
      email: email.toLowerCase(),
      fullName: fullName,
      avatar: req.user.picture,
      fbId: id,
    };

    const newUser = await this.registerNewUser(req, userData);
    return this.jwtService.issueToken(newUser);
  }
}
