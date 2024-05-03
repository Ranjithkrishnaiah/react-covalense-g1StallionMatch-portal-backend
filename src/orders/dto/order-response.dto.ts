import { ApiResponseProperty } from '@nestjs/swagger';

export class OrderResponseDto {
  @ApiResponseProperty()
  id: number;
}
