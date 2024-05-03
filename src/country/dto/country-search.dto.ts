import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class CountrySearchDto {
  @ApiProperty()
  @IsOptional()
  searchBy?: string;
}
