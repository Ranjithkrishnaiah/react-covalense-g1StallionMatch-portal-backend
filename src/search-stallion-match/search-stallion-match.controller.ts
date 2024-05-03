import { Body, Controller, Get, Post, Query, SetMetadata, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { RoleGuard } from 'src/role/role.gaurd';
import { RecentSearchRespose } from './dto/recent-search-response.dto';
import { SearchOptionsDto } from './dto/search-options.dto';
import { StallionSearchRespose } from './dto/stallion-search-response.dto';
import { SearchStallionMatchService } from './search-stallion-match.service';
import { ShareSMSearchResultAuthDto } from './dto/share-sm-search-result-auth.dto';
import { ShareSMSearchResultPublicDto } from './dto/share-sm-search-result-public.dto';

@ApiTags('StallionMatch Searches')
@Controller({
  path: 'sm-search',
  version: '1',
})
export class SearchStallionMatchController {
  constructor(private readonly smService: SearchStallionMatchService) {}

  @ApiOperation({
    summary: 'Get All Most Searched Stallions',
  })
  @ApiOkResponse({
    description: '',
    type: StallionSearchRespose,
    isArray: true,
  })
  @Get('most-searched-stallions')
  async findAllWithCounts(@Query() searchOptions: SearchOptionsDto) {
    return await this.smService.findAllWithCounts(searchOptions);
  }

  @ApiOperation({
    summary: 'Get All Recent Searched Stallions By Individual Member',
  })
  @ApiOkResponse({
    description: '',
    type: RecentSearchRespose,
    isArray: true,
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    id: 'SMSEARCH_GET_RECENT',
    method: 'READ',
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('recent')
  async findAllRecent(): Promise<RecentSearchRespose[]> {
    let pageLimit = 12;
    return await this.smService.findAllRecent(pageLimit);
  }

  @ApiOperation({
    summary: 'Share SM Search Result - Auth',
  })
  @ApiOkResponse({
    description: 'Share SM Search Result - Auth',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Post('share-sm-search-result-auth')
  async shareSMSearchResultAuth(@Body() data: ShareSMSearchResultAuthDto,) {
    return await this.smService.shareSMSearchResultAuth(data);
  }

  @ApiOperation({
    summary: 'Share SM Search Result - Public',
  })
  @ApiOkResponse({
    description: 'Share SM Search Result - Public',
  })
  @Post('share-sm-search-result')
  async shareSMSearchResultPublic(@Body() data: ShareSMSearchResultPublicDto,) {
    return await this.smService.shareSMSearchResultPublic(data);
  }
}
