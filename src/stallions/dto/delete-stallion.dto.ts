import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class deleteStallionDto {
  @ApiProperty({ example: '6492171C-6A55-42B3-8B84-C28C3006664D' })
  @IsNotEmpty()
  @IsUUID()
  stallionId: string;
}
