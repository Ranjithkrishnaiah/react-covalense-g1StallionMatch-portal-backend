import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsUUID } from 'class-validator';

export class HypoMatingDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  stallionId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  mareId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  generation: number;
}
