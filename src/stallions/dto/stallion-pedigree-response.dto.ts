import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import { HorseInfoResponseDto } from 'src/horses/dto/horse-info-response.dto';

export class StallionPedigreeResponseDto {
  @ApiResponseProperty()
  pedigreeTreeLevel?: number;

  @ApiResponseProperty()
  farmLogo: string;

  @ApiResponseProperty()
  colourId: number;

  @ApiProperty({
    description: 'Horse info',
    type: [HorseInfoResponseDto],
  })
  @ApiResponseProperty()
  horsePedigrees: HorseInfoResponseDto[];
}
