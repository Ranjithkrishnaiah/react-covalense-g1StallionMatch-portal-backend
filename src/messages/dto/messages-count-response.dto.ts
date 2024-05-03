import { ApiResponseProperty } from '@nestjs/swagger';

export class MessageCountResponseDto {
  @ApiResponseProperty()
  received: number;

  @ApiResponseProperty()
  sent: number;

  @ApiResponseProperty()
  nomination: number;
}
