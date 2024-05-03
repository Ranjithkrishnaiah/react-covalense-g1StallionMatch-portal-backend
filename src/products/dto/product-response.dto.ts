import { ApiResponseProperty } from '@nestjs/swagger';

export class ProductResponseDto {
  @ApiResponseProperty()
  id: number;

  @ApiResponseProperty()
  categoryId: number;

  @ApiResponseProperty()
  productName: string;

  @ApiResponseProperty()
  price: number;

  @ApiResponseProperty()
  currencyId: number;
}
