import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class UpdateMemberEmailDto {
  @ApiProperty({ example: 'farm@user-farm.com' })
  @IsEmail()
  email: string;
}
