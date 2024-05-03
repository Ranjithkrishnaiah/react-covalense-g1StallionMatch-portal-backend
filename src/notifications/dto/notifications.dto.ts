import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateNotificationDto {
  @ApiProperty({ example: 'www.notifications.com' })
  @IsOptional()
  notificationShortUrl: string;

  @ApiProperty()
  @IsNumber()
  messageTemplateId: number;

  @ApiProperty()
  @IsNumber()
  recipientId: number;

  @ApiProperty()
  @IsString()
  messageTitle: string;

  @ApiProperty()
  @IsString()
  messageText: string;

  @ApiProperty()
  @IsOptional()
  farmid?: number;

  isRead?: boolean | false;
  createdBy?: number | null;
  notificationType?: number | null;
  actionUrl?: string | null;
}
