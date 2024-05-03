import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class FarmLocationDto {
  @ApiProperty({ example: 10 })
  @IsNumber()
  countryId: number;

  @ApiProperty({ example: 99 })
  @IsOptional()
  stateId: number;

  @ApiProperty({ example: 2 })
  @IsNumber()
  farmId: number;

  @ApiProperty({ example: 'Sydney, Australia' })
  @IsOptional()
  address: string;

  @ApiProperty({ example: '2023' })
  @IsOptional()
  postcode: string;
}
