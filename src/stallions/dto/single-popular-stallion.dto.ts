import { ApiResponseProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

export class SinglePopularStallionDto {
  @ApiResponseProperty()
  @Type(() => Number)
  @IsNumber()
  countryId: number;

  @ApiResponseProperty({ example: '2022-11-01' })
  @IsString()
  fromDate: string;

  @ApiResponseProperty({ example: '2022-11-15' })
  @IsString()
  toDate: string;
}
