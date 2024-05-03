import { ApiResponseProperty } from '@nestjs/swagger';

export class NotificationResponseDto {
  @ApiResponseProperty()
  notificationId: string;

  @ApiResponseProperty()
  notificationShortUrl: string;

  @ApiResponseProperty()
  messageTemplateId: number;

  @ApiResponseProperty()
  messageTitle: string;

  @ApiResponseProperty()
  messageText: string;

  @ApiResponseProperty()
  isRead: boolean;

  @ApiResponseProperty()
  timeStamp: Date;

  @ApiResponseProperty()
  linkName: string;

  @ApiResponseProperty()
  linkAction: string;

  @ApiResponseProperty()
  featureId: number;

  @ApiResponseProperty()
  featureName: string;

  @ApiResponseProperty()
  messageTypeId: number;

  @ApiResponseProperty()
  messageTypeName: string;

  @ApiResponseProperty()
  senderId: number;

  @ApiResponseProperty()
  senderName: string;

  @ApiResponseProperty()
  roleName: string;
}
