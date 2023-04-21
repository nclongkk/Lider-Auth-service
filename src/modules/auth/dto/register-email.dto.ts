import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import {
  i18nIsEmailMsg,
  i18nIsNotEmptyMsg,
  i18nIsStringMsg,
} from '../../../i18n/i18n.helper';

export class RegisterEmailDto {
  @ApiProperty({ type: String })
  @IsOptional()
  @IsNotEmpty({ message: i18nIsNotEmptyMsg() })
  @IsString({ message: i18nIsStringMsg() })
  fullName?: string;

  @ApiProperty({ type: String })
  @Transform(({ value }) => value?.toLowerCase?.().trim())
  @IsEmail({}, { message: i18nIsEmailMsg() })
  email: string;

  @ApiProperty({ type: String })
  @MaxLength(100)
  @IsNotEmpty({ message: i18nIsNotEmptyMsg() })
  password?: string;
}
