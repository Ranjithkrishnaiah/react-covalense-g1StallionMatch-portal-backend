import { ApiResponseProperty } from '@nestjs/swagger';

export class PriceRangeResponseDto {
  @ApiResponseProperty()
  scaleRange: number;

  @ApiResponseProperty()
  minPrice: number;

  @ApiResponseProperty()
  maxPrice: number;

  @ApiResponseProperty()
  minInputPrice: number;

  @ApiResponseProperty()
  maxInputPrice: number;
}
