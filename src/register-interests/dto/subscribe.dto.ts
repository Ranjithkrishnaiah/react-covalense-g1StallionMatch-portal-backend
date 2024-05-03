import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class SubscribeDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
