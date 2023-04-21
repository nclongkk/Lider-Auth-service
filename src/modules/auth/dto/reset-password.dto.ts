import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { i18nIsNotEmptyMsg, i18nIsStringMsg } from '../../../i18n/i18n.helper';

export class ResetPasswordDto {
  @ApiProperty({ type: String })
  @IsString({ message: i18nIsStringMsg() })
  @IsNotEmpty({ message: i18nIsNotEmptyMsg() })
  hash: string;

  @ApiProperty({ type: String })
  @IsString({ message: i18nIsStringMsg() })
  @IsNotEmpty({ message: i18nIsNotEmptyMsg() })
  newPassword: string;
}
