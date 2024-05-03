import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class CreateStallionLocationDto {
  @ApiProperty()
  @IsNumber()
  countryId: number;

  @ApiProperty()
  @IsOptional()
  stateId: number;

  @ApiProperty()
  @IsNumber()
  stallionId: number;

  createdBy?: number | null;
}
