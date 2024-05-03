import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateExtendedBoostProfileDto {
  @ApiProperty()
  @IsNotEmpty()
  message: string;

  @ApiProperty()
  @IsNotEmpty()
  boostTypeId: number;

  @ApiProperty()
  @IsOptional()
  isTrackedFarmStallion: boolean;

  @ApiProperty()
  @IsOptional()
  isSearchedFarmStallion: boolean;

  @ApiProperty()
  @IsNotEmpty()
  createdBy: number;
}
