import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateMemberAddressDto {
  @ApiProperty()
  @IsNotEmpty()
  countryId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsOptional()
  stateId?: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsOptional()
  city?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsOptional()
  address?: string;

  @ApiProperty()
  @IsNotEmpty()
  postcode?: string;
}
