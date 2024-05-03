import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateMsgRecepientDto {
  @ApiProperty()
  @IsNotEmpty()
  messageId: number;

  @ApiProperty()
  @IsOptional()
  channelId: number;

  recipientId: number | null;
  createdBy: number | null;
  isRead: boolean | false;
}
