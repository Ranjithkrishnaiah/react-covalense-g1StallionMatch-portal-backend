import { ApiResponseProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';
export class CountryDto {
  @ApiResponseProperty()
  @Type(() => Number)
  @IsNumber()
  countryId: number;
}
