import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class DeleteMessageDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  channelId: string;
}
