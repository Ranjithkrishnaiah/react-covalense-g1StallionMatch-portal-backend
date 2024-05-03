import { ApiResponseProperty } from '@nestjs/swagger';

export class PreferedNotificationResponseDto {
  @ApiResponseProperty()
  notificationTypeId: number;

  @ApiResponseProperty()
  isActive: boolean;

  @ApiResponseProperty()
  notificationTypeName: number;
}
