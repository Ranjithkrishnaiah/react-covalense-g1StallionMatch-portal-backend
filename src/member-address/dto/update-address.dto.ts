import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateAddressDto {
  @ApiProperty()
  @IsNotEmpty()
  countryId: number;

  @ApiProperty()
  @IsOptional()
  postcode: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsOptional()
  address: string;
}
