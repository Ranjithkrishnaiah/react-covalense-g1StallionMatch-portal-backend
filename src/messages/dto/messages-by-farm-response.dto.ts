import { ApiResponseProperty } from '@nestjs/swagger';

export class MessagesByFarmResponseDto {
  @ApiResponseProperty()
  messageId: number;

  @ApiResponseProperty()
  message: string;

  @ApiResponseProperty()
  timestamp: string;

  @ApiResponseProperty()
  farmName: string;

  @ApiResponseProperty()
  recipientId: number;

  @ApiResponseProperty()
  isRead: boolean;

  @ApiResponseProperty()
  senderName: string;

  @ApiResponseProperty()
  recipientName: string;
}
