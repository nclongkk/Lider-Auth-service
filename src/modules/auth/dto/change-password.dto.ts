import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';
import {
  i18nIsNotEmptyMsg,
  i18nIsStringMsg,
  i18nLengthMsg,
} from '../../../i18n/i18n.helper';

export class ChangePasswordDto {
  @ApiProperty({ type: String })
  @IsString({ message: i18nIsStringMsg() })
  @IsNotEmpty({ message: i18nIsNotEmptyMsg() })
  @Length(6, 255, { message: i18nLengthMsg() })
  currentPassword: string;

  @ApiProperty({ type: String })
  @IsString({ message: i18nIsStringMsg() })
  @IsNotEmpty({ message: i18nIsNotEmptyMsg() })
  @Length(6, 255, { message: i18nLengthMsg() })
  newPassword: string;
}
