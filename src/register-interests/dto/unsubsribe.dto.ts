import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class UnSubscribeDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  unSubscribeKey: string;
}
