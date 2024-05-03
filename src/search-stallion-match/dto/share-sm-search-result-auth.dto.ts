import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ShareSMSearchResultAuthDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  toName?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  toEmail?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  searchPageUrl?: string;
}
