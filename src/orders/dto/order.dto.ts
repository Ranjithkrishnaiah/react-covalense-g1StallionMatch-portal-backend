import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsEmail } from 'class-validator';

export class OrderDto {
  @ApiProperty()
  @IsNumber()
  currencyId: number;

  @ApiProperty()
  @IsNumber()
  countryId: number;

  @ApiProperty()
  @IsNumber()
  postalCode: string;

  @ApiProperty()
  @IsNumber()
  total: number;

  @ApiProperty()
  @IsString()
  fullName: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  sessionId?: string | null;
  createdBy?: number | null;
}
