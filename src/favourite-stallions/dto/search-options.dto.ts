import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { FavouriteStallionSort } from 'src/utils/constants/favourite-listing-sort';
import { PageOptionsDto } from 'src/utils/dtos/page-options.dto';

export class SearchOptionsDto extends PageOptionsDto {
  @ApiPropertyOptional({
    enum: FavouriteStallionSort,
    default: FavouriteStallionSort.NAME,
  })
  @IsEnum(FavouriteStallionSort)
  @IsOptional()
  readonly sortBy?: FavouriteStallionSort = FavouriteStallionSort.NAME;
}
