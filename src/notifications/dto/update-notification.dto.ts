import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class UpdateNotificationDto {
  @ApiProperty()
  @IsUUID()
  notificationUuid: string;

  isRead?: boolean | false;
  modifiedBy?: number | null;
}
