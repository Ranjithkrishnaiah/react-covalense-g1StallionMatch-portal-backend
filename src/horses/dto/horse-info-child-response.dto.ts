import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import { HorseInfoResponseDto } from './horse-info-response.dto';

export class HorseInfoChildResponseDto {
  @ApiResponseProperty()
  id: number;

  @ApiResponseProperty()
  progenyId: number;

  @ApiResponseProperty()
  horseId: string;

  @ApiResponseProperty()
  horseName: string;

  @ApiResponseProperty()
  countryId: number;

  @ApiResponseProperty()
  colourId: number;

  @ApiResponseProperty()
  sex: string;

  @ApiResponseProperty()
  gelding: boolean;

  @ApiResponseProperty()
  isLocked: boolean;

  @ApiResponseProperty()
  isVerified: boolean;

  @ApiResponseProperty()
  horseTypeId: number;

  @ApiResponseProperty()
  generation: number;

  @ApiResponseProperty()
  yob: number;

  @ApiResponseProperty()
  tag: string;

  @ApiResponseProperty()
  cob: string;

  @ApiProperty({
    description: 'Horse info',
    type: [HorseInfoResponseDto],
  })
  @ApiResponseProperty()
  children: HorseInfoResponseDto[];
}
