import { ApiResponseProperty } from '@nestjs/swagger';

export class MessagesListResponseDto {
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
  unreadCount: number;

  @ApiResponseProperty()
  farmAddress: string;

  @ApiResponseProperty()
  farmCountryName: string;

  @ApiResponseProperty()
  farmStateName: string;
}
