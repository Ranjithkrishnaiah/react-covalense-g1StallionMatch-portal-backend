import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class UpdateMessageDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  channelId: string;

  @ApiProperty()
  @IsNotEmpty()
  status: number;
}
