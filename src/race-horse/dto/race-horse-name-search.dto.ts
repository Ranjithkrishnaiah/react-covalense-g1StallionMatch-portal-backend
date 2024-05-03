import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, MinLength } from 'class-validator';

export class RaceHorseNameSearchDto {
  @ApiProperty()
  @Type(() => String)
  @MinLength(3)
  @IsString()
  readonly raceHorseName?: string;
}
