import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateBoostStallionDto {
  @ApiProperty()
  @IsNotEmpty()
  boostProfileId: number;

  @ApiProperty()
  @IsNotEmpty()
  stallionId: number;

  createdBy?: number | null;
}
