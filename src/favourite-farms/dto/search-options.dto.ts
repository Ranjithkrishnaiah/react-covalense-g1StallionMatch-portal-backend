import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { FavouriteFarmsSort } from 'src/utils/constants/favourite-listing-sort';
import { PageOptionsDto } from 'src/utils/dtos/page-options.dto';

export class SearchOptionsDto extends PageOptionsDto {
  @ApiPropertyOptional({
    enum: FavouriteFarmsSort,
    default: FavouriteFarmsSort.NAME,
  })
  @IsEnum(FavouriteFarmsSort)
  @IsOptional()
  readonly sortBy?: FavouriteFarmsSort = FavouriteFarmsSort.NAME;
}
