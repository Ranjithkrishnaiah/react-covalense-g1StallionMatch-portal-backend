import { ApiResponseProperty } from '@nestjs/swagger';

export class PromoCodeResponseDto {
  @ApiResponseProperty()
  id: number;

  @ApiResponseProperty()
  promoCode: string;

  @ApiResponseProperty()
  discountType: string;

  @ApiResponseProperty()
  discountValue: number;

  @ApiResponseProperty()
  currencyId: number;
}
