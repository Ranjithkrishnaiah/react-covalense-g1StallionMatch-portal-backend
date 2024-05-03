import { Controller, Get, Query, SetMetadata, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { SearchMostMatchedDamSireOptionDto } from './dto/search-most-matched-dam-sire-option.dto';
import { StallionsService } from 'src/stallions/stallions.service';
import { StallionGuard } from 'src/stallion-gaurd/stallion.gaurd';
import { StallionReportSearchOptionDto } from './dto/search-options.dto';
import { SearchStallionMatchService } from 'src/search-stallion-match/search-stallion-match.service';

@ApiTags('Stallion Report')
@Controller({
  path: 'stallion-report',
  version: '1',
})
export class StallionReportController {
  constructor(
    private readonly stallionsService: StallionsService,
    private readonly searchStallionMatchService: SearchStallionMatchService,
  ) {}

  @ApiOperation({
    summary: 'Matched Mares in Stallion Match',
  })
  @ApiOkResponse({
    description: '',
    type: SearchMostMatchedDamSireOptionDto,
  })
  @Get('/matched-mares')
  findMatchedMares(
    @Query() searchOptionsDto: SearchMostMatchedDamSireOptionDto,
  ) {
    return this.stallionsService.findMatchedMares(searchOptionsDto, 1);
  }

  @ApiOperation({
    summary: 'Get Stallion Close Analytics',
  })
  @ApiOkResponse({
    description: '',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Get('close-analytics')
  async getCloseAnalytics(
    @Query() searchOptionsDto: StallionReportSearchOptionDto,
  ) {
    return await this.stallionsService.getCloseAnalyticsForReport(
      searchOptionsDto,
    );
  }

  @ApiOperation({
    summary: 'Get Stallion Key Statistics',
  })
  @ApiOkResponse({
    description: '',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Get('key-statistics')
  async getKeyStatistics(
    @Query() searchOptionsDto: StallionReportSearchOptionDto,
  ) {
    return await this.stallionsService.getKeyStatisticsForReport(
      searchOptionsDto,
    );
  }

  @ApiOperation({
    summary: 'Get Progeny Tracker of a Stallion',
  })
  @ApiOkResponse({
    description: '',
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    id: 'STALLION_REPORT_GET_PROGENY_TRACKER',
    method: 'READ',
    stallionIn: 'query',
    stallionKey: 'stallionId',
  })
  @UseGuards(JwtAuthenticationGuard, StallionGuard)
  @Get('progeny-tracker')
  getStallionProgenyTracker(
    @Query() searchOptionsDto: SearchMostMatchedDamSireOptionDto,
  ) {
    return this.stallionsService.getStallionProgenyTracker(searchOptionsDto, 1);
  }

  @ApiOperation({
    summary: 'Get Stallion Match Activity List',
  })
  @ApiOkResponse({
    description: '',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Get('stallion-match-activity')
  async stallionMatchActivity(
    @Query() searchOptionsDto: StallionReportSearchOptionDto,
  ) {
    return await this.searchStallionMatchService.stallionMatchActivity(
      searchOptionsDto,
    );
  }

  @Get('downloadPdf')
  async downloadBreederReport(
    @Query() searchOptionsDto: StallionReportSearchOptionDto,
  ) {
    return await this.stallionsService.downloadStallionReport(searchOptionsDto);
  }

  @ApiOperation({
    summary: 'Get Stallion Close Analytics',
  })
  @ApiOkResponse({
    description: '',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Get('stallion-roaster/close-analytics')
  async getCloseAnalyticsForRoaster(
    @Query() searchOptionsDto: StallionReportSearchOptionDto,
  ) {
    return await this.stallionsService.getCloseAnalytics(searchOptionsDto);
  }

  @ApiOperation({
    summary: 'Get Stallion Key Statistics',
  })
  @ApiOkResponse({
    description: '',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Get('stallion-roaster/key-statistics')
  async getKeyStatisticsForRoaster(
    @Query() searchOptionsDto: StallionReportSearchOptionDto,
  ) {
    return await this.stallionsService.getKeyStatistics(searchOptionsDto);
  }
}
