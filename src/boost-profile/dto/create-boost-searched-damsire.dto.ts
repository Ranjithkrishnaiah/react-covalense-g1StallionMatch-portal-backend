import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateBoostSearchedDamsireDto {
  @ApiProperty()
  @IsNotEmpty()
  boostProfileId: number;

  @ApiProperty()
  @IsNotEmpty()
  horseId: number;

  createdBy?: number | null;
}
