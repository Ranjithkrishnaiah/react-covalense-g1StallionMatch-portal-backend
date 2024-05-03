import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateBoostUserLocationDto {
  @ApiProperty()
  @IsNotEmpty()
  boostProfileId: number;

  @ApiProperty()
  @IsNotEmpty()
  countryId: number;

  createdBy?: number | null;
}
