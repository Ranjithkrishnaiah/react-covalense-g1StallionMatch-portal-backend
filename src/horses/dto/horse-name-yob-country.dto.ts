import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class HorseNameYobCountryDto {
  @ApiResponseProperty()
  @IsUUID()
  @ApiProperty({
    type: 'string',
    name: 'horseId',
  })
  horseUuid: string;

  @ApiResponseProperty()
  @IsString()
  @ApiProperty({
    type: 'string',
    name: 'horseName',
  })
  horseName: string;

  @ApiResponseProperty()
  @IsString()
  @ApiProperty({
    type: 'number',
    name: 'yob',
  })
  yob: number;

  @ApiResponseProperty()
  @IsString()
  @ApiProperty({
    type: 'string',
    name: 'countryCode',
  })
  countryCode: string;
}
