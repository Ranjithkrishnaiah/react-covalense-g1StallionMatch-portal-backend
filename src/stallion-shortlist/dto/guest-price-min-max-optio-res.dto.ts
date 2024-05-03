import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class GuestPriceMinMaxOptionsDtoRes {
  @ApiResponseProperty()
  @IsUUID()
  @ApiProperty({
    type: 'number',
    name: 'scaleRange',
  })
  scaleRange: number;

  @ApiResponseProperty()
  @IsString()
  @ApiProperty({
    type: 'number',
    name: 'minPrice',
  })
  minPrice: number;

  @ApiResponseProperty()
  @IsString()
  @ApiProperty({
    type: 'number',
    name: 'maxPrice',
  })
  maxPrice: number;

  @ApiResponseProperty()
  @IsString()
  @ApiProperty({
    type: 'number',
    name: 'minInputPrice',
  })
  minInputPrice: number;

  @ApiResponseProperty()
  @IsString()
  @ApiProperty({
    type: 'number',
    name: 'maxInputPrice',
  })
  maxInputPrice: number;
}
