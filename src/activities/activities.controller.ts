import { Controller, Get, UseGuards, Query, SetMetadata } from '@nestjs/common';
import { ActivitiesService } from './activity.service';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { PageOptionsDto } from 'src/utils/dtos/page-options.dto';
import { ApiPaginatedResponse } from 'src/utils/decorators/api-paginated-response.decorator';
import { SearchStallionMatchService } from 'src/search-stallion-match/search-stallion-match.service';
import { BreederRecentSearchRespose } from 'src/search-stallion-match/dto/breeder-recent-search-response.dto';
import { RoleGuard } from 'src/role/role.gaurd';
import { FarmStallionMatchedActivitySearchOptionDto } from 'src/stallion-trends/dto/farm-stallion-match-activity-search.dto';
import { BreederActivitySearchOptionsDto } from './dto/breeder-activity-search-options.dto';
import { FarmGuard } from 'src/farms/guards/farm.guard';

@ApiTags('Activities')
@Controller({
  path: 'activities',
  version: '1',
})
export class ActivitiesController {
  constructor(
    private readonly activitiesService: ActivitiesService,
    private readonly smService: SearchStallionMatchService,
  ) {}

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Find Breeder Activity',
  })
  @ApiOkResponse({
    description: '',
    type: BreederRecentSearchRespose,
    isArray: true,
  })
  @SetMetadata('api', {
    id: 'ACTIVITIES_GET_BREEDER_ACTIVITIES',
    method: 'GET',
    farmIdIn: 'query',
    farmKey: 'farmId',
  })
  @UseGuards(JwtAuthenticationGuard, FarmGuard)
  @Get('breeder')
  findBreederActivity(
    @Query() pageOptionsDto: BreederActivitySearchOptionsDto,
  ): Promise<Object> {
    return this.activitiesService.findBreederActivity(pageOptionsDto);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Find Stallion Activity',
  })
  @ApiPaginatedResponse(Object)
  @Get('stallion')
  findStallionActivity(
    @Query() pageOptionsDto: FarmStallionMatchedActivitySearchOptionDto,
  ) {
    return this.smService.findStallionActivity(pageOptionsDto);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Breeder Recent Searches',
  })
  @ApiOkResponse({
    description: '',
    type: BreederRecentSearchRespose,
    isArray: true,
  })
  @SetMetadata('api', {
    id: 'ACTIVITIES_GET_RECENT',
    method: 'READ',
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('breeder-recent-searches')
  findRecentSearches(
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<BreederRecentSearchRespose[]> {
    let pageLimit = 5;
    return this.smService.findAllRecentSearches(pageLimit);
  }
}
