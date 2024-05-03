import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateStallionShortlistDto {
  @ApiProperty({ example: 'fffac6bd-f4e1-4b1a-aa13-3211b5310b6f' })
  @IsNotEmpty()
  @IsUUID()
  stallionId: string;
}
