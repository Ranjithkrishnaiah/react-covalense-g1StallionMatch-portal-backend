import { ApiResponseProperty } from '@nestjs/swagger';

export class PaymentStatusResponseDto {
  @ApiResponseProperty()
  id: number;

  @ApiResponseProperty()
  statusName: string;
}
