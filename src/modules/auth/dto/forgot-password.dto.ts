import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import {
  i18nIsEmailMsg,
  i18nIsNotEmptyMsg,
  i18nIsStringMsg,
} from '../../../i18n/i18n.helper';

export class ForgotPasswordDto {
  @ApiProperty({ type: String })
  @IsString({ message: i18nIsStringMsg() })
  @IsNotEmpty({ message: i18nIsNotEmptyMsg() })
  @IsEmail({}, { message: i18nIsEmailMsg() })
  @Transform(({ value }) => value.toLowerCase().trim())
  email: string;
}
