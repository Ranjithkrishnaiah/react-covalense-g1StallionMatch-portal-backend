import { ApiResponseProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class HorseCountsDto {
  @ApiResponseProperty()
  @IsNumber()
  memberMares: number;

  @ApiResponseProperty()
  @IsNumber()
  favouriteStallions: number;

  @ApiResponseProperty()
  @IsNumber()
  favouriteDamsires: number;

  @ApiResponseProperty()
  @IsNumber()
  favouriteFarms: number;
}
