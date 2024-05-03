import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { CreateMessageDto } from 'src/messages/dto/create-message.dto';
import { MessageMediaDto } from './message-media.dto';

export class CreateMessageMediaDto extends CreateMessageDto {
  @ApiProperty({ type: [MessageMediaDto] })
  @IsOptional()
  @Type(() => MessageMediaDto)
  medias: MessageMediaDto[];
}
