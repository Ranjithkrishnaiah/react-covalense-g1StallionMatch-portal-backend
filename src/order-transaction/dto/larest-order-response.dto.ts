import { ApiResponseProperty } from '@nestjs/swagger';

export class LatestorderResponse {
  @ApiResponseProperty()
  orderId: string;

  @ApiResponseProperty()
  paymentIntent: string;
}
