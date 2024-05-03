import { ApiResponseProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class SearchByNameResDto {
  @ApiResponseProperty()
  farmId: string;

  @ApiResponseProperty()
  farmName: string;

  @ApiResponseProperty()
  countryName: string;

  @ApiResponseProperty()
  stateName: string;
}
