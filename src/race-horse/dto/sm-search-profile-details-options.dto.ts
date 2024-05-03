import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class SmSearchProfileDetailsOptionsDto {
  @ApiProperty()
  @IsUUID()
  readonly horseId?: string;
}
