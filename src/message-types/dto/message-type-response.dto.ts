import { ApiResponseProperty } from '@nestjs/swagger';

export class MessageTypeResponseDto {
  @ApiResponseProperty()
  id: number;

  @ApiResponseProperty()
  messageTypeName: string;
}
