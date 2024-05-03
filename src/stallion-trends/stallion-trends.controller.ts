import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { CountryDto } from 'src/stallions/dto/country-filter.dto';
import { SearchTopMostOptionDto } from 'src/stallions/dto/search-top-most-option.dto';
import { TopMostStallionResponseDto } from 'src/stallions/dto/top-most-stallion-response.dto';
import { SearchMostMatchedDamSireOptionDto } from './dto/search-most-matched-dam-sire-option.dto';
import { StallionTrendsService } from './stallion-trends.service';
import { SearchStallionMatchService } from 'src/search-stallion-match/search-stallion-match.service';
import { TopMatchedSiresDto } from './dto/top-matched.dto';
import { FarmStallionMatchedActivitySearchOptionDto } from './dto/farm-stallion-match-activity-search.dto';
import { StallionTrendsSearchOptionDto } from './dto/search-options.dto';
import { CountryResponseDto } from 'src/country/dto/country-response.dto';

@ApiTags('Stallion Trends')
@Controller({
  path: 'stallion-trends',
  version: '1',
})
export class StallionTrendsController {
  constructor(
    private readonly stallionTrendsService: StallionTrendsService,
    private readonly searchStallionMatchService: SearchStallionMatchService,
  ) {}

  @ApiOperation({
    summary: 'Get Top Performing Stallion With Date Range',
  })
  @ApiOkResponse({
    description: '',
    type: TopMostStallionResponseDto,
  })
  @Get('/top-performing-stallion')
  findTopPerformingStallion(
    @Request() request,
    @Query() searchOptionsDto: SearchTopMostOptionDto,
  ): Promise<TopMostStallionResponseDto> {
    return this.stallionTrendsService.findTopPerformingStallion(
      searchOptionsDto,
    );
  }

  @ApiOperation({
    summary: 'Get Single Popular Stallion With Date Range',
  })
  // @ApiBearerAuth()
  @ApiOkResponse({
    description: '',
    type: TopMostStallionResponseDto,
  })
  @Get('/popular-stallion')
  findSinglePopularStallion(
    @Request() request,
    @Query() searchOptionsDto: SearchTopMostOptionDto,
  ): Promise<TopMostStallionResponseDto> {
    return this.stallionTrendsService.findSinglePopularStallion(
      searchOptionsDto,
    );
  }

  @ApiOperation({
    summary: 'Get Popular Dam Sire With Date Range',
  })
  @ApiOkResponse({
    description: '',
    type: TopMostStallionResponseDto,
  })
  @Get('/popular-dam-sire')
  findPopularDamSire(
    @Request() request,
    @Query() searchOptionsDto: SearchTopMostOptionDto,
  ) {
    return this.stallionTrendsService.findPopularDamSire(searchOptionsDto);
  }

  @ApiOperation({
    summary: 'Get Most Matched Dam Sire With Date Range',
  })
  @ApiOkResponse({
    description: '',
    type: TopMostStallionResponseDto,
  })
  @Get('/most-matched-dam-sire')
  findMostMatchedDamSire(
    @Request() request,
    @Query() searchOptionsDto: SearchMostMatchedDamSireOptionDto,
  ) {
    return this.stallionTrendsService.findMostMatchedDamSire(searchOptionsDto);
  }

  @ApiOperation({
    summary: 'Get Hottest Cross',
  })
  @ApiOkResponse({
    description: '',
    type: TopMostStallionResponseDto,
  })
  @Get('/hottest-cross')
  findHottestCross(@Query() searchOption: CountryDto) {
    return this.searchStallionMatchService.findHottestCross(searchOption);
  }

  @ApiOperation({
    summary: 'Get Top 10 20/20 Matched Sires',
  })
  @ApiOkResponse({
    description: '',
  })
  @Get('/top-matched-sires')
  findTopMatchedSires(@Query() searchOption: TopMatchedSiresDto) {
    return this.searchStallionMatchService.findTopMatchedSires(searchOption);
  }

  @ApiOperation({
    summary: 'Get Top 10 20/20 Matched Broodmare Sires',
  })
  @ApiOkResponse({
    description: '',
  })
  @Get('/top-matched-broodmaresires')
  findTopMatchedBroodmareSires(@Query() searchOption: TopMatchedSiresDto) {
    return this.searchStallionMatchService.findTopMatchedBroodmareSires(
      searchOption,
    );
  }

  @ApiOperation({
    summary: 'Top 10 Perfect Match Matched Sires',
  })
  @ApiOkResponse({
    description: '',
  })
  @Get('/top-perfect-matched-sires')
  findTopPerfectMatchedSires(@Query() searchOption: TopMatchedSiresDto) {
    return this.searchStallionMatchService.findTopPerfectMatchedSires(
      searchOption,
    );
  }

  @ApiOperation({
    summary: 'Get Top 10 Perfect Matched Broodmare Sires',
  })
  @ApiOkResponse({
    description: '',
  })
  @Get('/top-perfect-matched-broodmaresires')
  findTopPerfectMatchedBroodmareSires(
    @Query() searchOption: TopMatchedSiresDto,
  ) {
    return this.searchStallionMatchService.findTopPerfectMatchedBroodmareSires(
      searchOption,
    );
  }

  @ApiOperation({
    summary: 'Get Stallion Match Activity List',
  })
  @ApiOkResponse({
    description: '',
  })
  // @ApiBearerAuth()
  // @UseGuards(JwtAuthenticationGuard)
  @Get('stallion-match-activity')
  async stallionMatchActivity(
    @Query() searchOptionsDto: StallionTrendsSearchOptionDto,
  ) {
    return await this.searchStallionMatchService.stallionMatchActivityForTrends(
      searchOptionsDto,
    );
  }

  @ApiOperation({
    summary: 'Get Stallion Match Activity List',
  })
  @ApiOkResponse({
    description: '',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Get('farm/stallion-match-activity')
  async farmStallionMatchActivity(
    @Query() searchOptionsDto: FarmStallionMatchedActivitySearchOptionDto,
  ) {
    return await this.searchStallionMatchService.farmStallionMatchActivity(
      searchOptionsDto,
    );
  }

  @ApiOperation({
    summary: 'Get Stallions Country List',
  })
  @ApiOkResponse({
    description: '',
  })
  @Get('countries')
  async getStallionsCountries(): Promise<CountryResponseDto[]> {
    return await this.stallionTrendsService.getStallionsCountries();
  }
}
