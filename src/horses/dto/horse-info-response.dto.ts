import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import { HorseInfoChildResponseDto } from './horse-info-child-response.dto';

export class HorseInfoResponseDto {
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
    type: [HorseInfoChildResponseDto],
  })
  @ApiResponseProperty()
  children: HorseInfoChildResponseDto[];
}
