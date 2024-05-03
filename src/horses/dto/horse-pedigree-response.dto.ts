import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import { HorseInfoResponseDto } from './horse-info-response.dto';

export class HorsePedigreeResponseDto {
  @ApiResponseProperty()
  pedigreeTreeLevel?: number;

  @ApiResponseProperty()
  horseId: string;

  @ApiResponseProperty()
  horseName: string;

  @ApiResponseProperty()
  yob: number;

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
  horseTypeId: boolean;

  @ApiProperty({
    description: 'Horse info',
    type: [HorseInfoResponseDto],
  })
  @ApiResponseProperty()
  horsePedigrees: HorseInfoResponseDto[];
}
