import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsUUID, MinLength } from 'class-validator';

export class ValidateRaceHorseUrlDto {
  @ApiProperty()
  @Type(() => String)
  @IsString()
  readonly slug: string;

  @ApiProperty()
  @Type(() => String)
  @IsUUID()
  readonly horseId: string;
}
