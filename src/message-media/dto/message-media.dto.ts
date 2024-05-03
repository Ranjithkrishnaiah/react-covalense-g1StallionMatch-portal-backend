import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class MessageMediaDto {
  @ApiProperty()
  @IsUUID()
  mediauuid: string;
}
