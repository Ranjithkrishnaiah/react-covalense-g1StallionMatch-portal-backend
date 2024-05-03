import { ApiResponseProperty } from '@nestjs/swagger';

export class PaymentMethodResponseDto {
  @ApiResponseProperty()
  id: number;

  @ApiResponseProperty()
  paymentMethod: string;
}
