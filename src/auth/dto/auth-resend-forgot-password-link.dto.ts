import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class AuthResendForgotPasswordLinkDto {
  @ApiProperty()
  @IsNotEmpty()
  hash: string;
}
