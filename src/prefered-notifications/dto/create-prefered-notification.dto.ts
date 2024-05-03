import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber } from 'class-validator';

export class CreatePreferedNotificationDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  notificationTypeId: number;

  @ApiProperty()
  @IsBoolean()
  isActive: boolean;

  memberId?: number | null;
  createdBy?: number | null;
}
