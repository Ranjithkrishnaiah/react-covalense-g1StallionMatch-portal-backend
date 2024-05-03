import { ApiResponseProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class SearchProductByCategoryDto {
  @ApiResponseProperty()
  @Type(() => Number)
  @IsNumber()
  categoryId: number;

  @ApiResponseProperty()
  @Type(() => Number)
  @IsNumber()
  currencyId: number;
}
