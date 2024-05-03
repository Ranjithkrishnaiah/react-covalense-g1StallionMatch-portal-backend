import { ApiResponseProperty } from '@nestjs/swagger';

export class MessagesListWithRecipientResponseDto {
  @ApiResponseProperty()
  messageId: number;

  @ApiResponseProperty()
  message: string;

  @ApiResponseProperty()
  subject: string;

  @ApiResponseProperty()
  timestamp: string;

  @ApiResponseProperty()
  farmId: string;

  @ApiResponseProperty()
  farmName: string;

  @ApiResponseProperty()
  recipientId: number;

  @ApiResponseProperty()
  isRead: boolean;

  @ApiResponseProperty()
  farmAddress: string;

  @ApiResponseProperty()
  farmCountryName: string;

  @ApiResponseProperty()
  farmStateName: string;

  @ApiResponseProperty()
  senderName: string;
}
