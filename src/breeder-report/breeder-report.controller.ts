import { Controller, Get, Query, SetMetadata, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { SearchMatchedMareDto } from './dto/search-matched-mares.dto';
import { FarmsService } from 'src/farms/farms.service';
import { SearchStallionMatchService } from 'src/search-stallion-match/search-stallion-match.service';
import { BreederStallionMatchActivityDto } from './dto/breeder-stallion-match-activity.dto';
import { FarmGuard } from 'src/farms/guards/farm.guard';

@ApiTags('Breeder Report')
@Controller({
  path: 'breeder-report',
  version: '1',
})
export class BreederReportController {
  constructor(
    private readonly farmsService: FarmsService,
    private readonly searchStallionMatchService: SearchStallionMatchService,
  ) {}

  @ApiOperation({
    summary: 'Matched Mares in Breeder Report',
  })
  @ApiOkResponse({
    description: '',
    type: SearchMatchedMareDto,
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    id: 'BREEDER_REPORT_GET_MATCHED_MARES',
    method: 'READ',
    farmIdIn: 'query',
    farmKey: 'farmId',
  })
  @UseGuards(JwtAuthenticationGuard, FarmGuard)
  @Get('/matched-mares')
  findMatchedMares(@Query() searchOptionsDto: SearchMatchedMareDto) {
    return this.farmsService.findMatchedMares(searchOptionsDto, 1);
  }

  @ApiOperation({
    summary: 'Get Stallion Match Activity List',
  })
  @ApiOkResponse({
    description: '',
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    id: 'BREEDER_REPORT_GET_SM_ACTIVITY',
    method: 'READ',
    farmIdIn: 'query',
    farmKey: 'farmId',
  })
  @UseGuards(JwtAuthenticationGuard, FarmGuard)
  @Get('stallion-match-activity')
  async stallionMatchActivity(
    @Query() searchOptionsDto: BreederStallionMatchActivityDto,
  ) {
    return await this.searchStallionMatchService.stallionMatchActivityForBreederReport(
      searchOptionsDto,
    );
  }

  @ApiBearerAuth()
  @SetMetadata('api', {
    id: 'BREEDER_REPORT_DOWNLOAD',
    method: 'READ',
    farmIdIn: 'query',
    farmKey: 'farmId',
  })
  @UseGuards(JwtAuthenticationGuard, FarmGuard)
  @Get('downloadPdf')
  async downloadBreederReport(
    @Query() searchOptionsDto: BreederStallionMatchActivityDto,
  ) {
    return await this.searchStallionMatchService.downloadBreederReport(
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
  @SetMetadata('api', {
    id: 'BREEDER_REPORT_KEY_STATISTICS',
    method: 'READ',
    farmIdIn: 'query',
    farmKey: 'farmId',
  })
  @UseGuards(JwtAuthenticationGuard, FarmGuard)
  @Get('key-statistics')
  async breederKeyStatistics(
    @Query() searchOptionsDto: BreederStallionMatchActivityDto,
  ) {
    return await this.searchStallionMatchService.breederKeyStatistics(
      searchOptionsDto,
    );
  }
}
