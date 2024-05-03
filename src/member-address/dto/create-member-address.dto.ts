import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateMemberAddressDto {
  @ApiProperty({ example: 10 })
  @IsNumber()
  countryId: number;

  @ApiProperty({ example: 99 })
  @IsOptional()
  @IsNumber()
  stateId?: number;

  @ApiProperty({ example: 'Sydney' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ example: 'Street1' })
  @IsOptional()
  @IsString()
  address: string;

  @ApiProperty({ example: '3685' })
  @IsString()
  postcode?: string;
}
