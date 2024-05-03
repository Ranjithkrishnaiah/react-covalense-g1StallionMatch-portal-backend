import { ApiResponseProperty } from '@nestjs/swagger';

export class NotificationTypesResponse {
  @ApiResponseProperty()
  id: number;

  @ApiResponseProperty()
  notificationTypeName: string;
}
