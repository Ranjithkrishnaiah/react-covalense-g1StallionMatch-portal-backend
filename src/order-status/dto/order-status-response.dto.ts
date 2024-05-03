import { ApiResponseProperty } from '@nestjs/swagger';

export class OrderStatusResponseDto {
  @ApiResponseProperty()
  id: number;

  @ApiResponseProperty()
  status: string;

  @ApiResponseProperty()
  createdBy: number;

  @ApiResponseProperty()
  createdOn: Date;
}
