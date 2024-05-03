import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class ReSubscribeDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  reSubscribeKey: string;
}
