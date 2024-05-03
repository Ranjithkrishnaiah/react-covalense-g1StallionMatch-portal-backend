import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReportRaceHorseService } from './report-race-horse.service';
import { ReportTemplatesService } from './report-templates.service';

@ApiTags('Report')
@Controller({
  path: 'report',
  version: '1',
})
export class ReportTemplatesController {
  constructor(private reportTemplatesService: ReportTemplatesService, private reportRaceHorseService: ReportRaceHorseService) {}

  @ApiOperation({
    summary: 'Get the Race Horse Pedigree Report',
  })
  @Get('race-horse/:horseId')
  async getRaceHorseSearchReport(
    @Param('horseId', new ParseUUIDPipe()) horseId: string,
  ) {
    return await this.reportRaceHorseService.getRaceHorseSearchReport(
      horseId,
      {},
    );
  }

  @ApiOperation({
    summary: 'Get the Race Horse Overlap Report',
  })
  @Get('race-horse-pedigree-overlap/:horseId/:overlapId')
  async getRaceHorsePedigreeOverlap(
    @Param('horseId', new ParseUUIDPipe()) horseId: string,
    @Param('overlapId', new ParseUUIDPipe()) overlapId: string,
  ) {
    return await this.reportRaceHorseService.getRaceHorsePedigreeOverlap(
      horseId,
      overlapId,
      {},
    );
  }

  @ApiOperation({
    summary: 'Get Stallion/Mare Search Report',
  })
  @Get('stallion-search/:stallionId/:mareId')
  async getStallionSearchReport(
    @Param('stallionId', new ParseUUIDPipe()) stallionId: string,
    @Param('mareId', new ParseUUIDPipe()) mareId: string,
  ) {
    return await this.reportTemplatesService.getStallionSearchReport(
      stallionId,
      mareId,
      {},
    );
  }

  @ApiOperation({
    summary: 'Get Stallion/Mare Search Overlap Report',
  })
  @Get('pedigree-overlap/:stallionId/:mareId/:overlapId')
  async getPedigreeOverlap(
    @Param('stallionId', new ParseUUIDPipe()) stallionId: string,
    @Param('mareId', new ParseUUIDPipe()) mareId: string,
    @Param('overlapId', new ParseUUIDPipe()) overlapId: string,
  ) {
    return await this.reportTemplatesService.getPedigreeOverlap(
      stallionId,
      mareId,
      overlapId,
      {},
    );
  }

  @Get('broodmare-sire/:mareId/:stallionIds')
  async generateBroodMareSireReport(
    @Param('mareId') mareId: number,
    @Param('stallionIds') stallionIds: string,
    @Param('fullName') fullName: string,
    @Param('email') email: string,
  ) {
    return await this.reportTemplatesService.generateBroodMareSireReport(
      mareId,
      stallionIds,
      {},
      fullName,
      email,
    );
  }

  @Get('sm-shortlist/:mareId/:stallionIds')
  async generateStallionMatchShortlistReport(
    @Param('mareId') mareId: number,
    @Param('stallionIds') stallionIds: string,
    @Param('fullName') fullName: string,
    @Param('email') email: string,
  ) {
    return await this.reportTemplatesService.generateStallionMatchShortlistReport(
      mareId,
      stallionIds,
      {},
      fullName,
      email,
    );
  }

  @Get('sm-pro/:mareId/:stallionIds')
  async generateStallionMatchProReport(
    @Param('mareId') mareId: number,
    @Param('stallionIds') stallionIds: string,
    @Param('fullName') fullName: string,
    @Param('email') email: string,
  ) {
    return await this.reportTemplatesService.generateStallionMatchProReport(
      mareId,
      stallionIds,
      {},
      fullName,
      email,
    );
  }

  @Get('broodmare-affinity/:mareId/:countryId')
  async generateBroodmareAffinityReport(
    @Param('mareId') mareId: number,
    @Param('countryId') countryId: number,
    @Param('fullName') fullName: string,
    @Param('email') email: string,
  ) {
    return await this.reportTemplatesService.generateBroodmareAffinityReport(
      mareId,
      countryId,
      {},
      fullName,
      email,
    );
  }

  @Get('sales-catelogue/:orderProductId')
  async generateSalesCatelogueReport(
    //  @Param('mareId', new ParseUUIDPipe()) mareId: string,
    @Param('orderProductId') orderProductId: number,
    @Param('fullName') fullName: string,
    @Param('email') email: string,
  ) {
    return await this.reportTemplatesService.generateSalesCatelogueReport(
      orderProductId,
      fullName,
      email,
    );
  }

  @Get('stallion-breeding-stocksale/:orderProductId')
  async generateStallionXBreederStockSaleReport(
    @Param('orderProductId') orderProductId: number,
    @Param('fullName') fullName: string,
    @Param('email') email: string
  ) {
    return await this.reportTemplatesService.generateStallionXBreederStockSaleReport(
      orderProductId,
      fullName,
      email
    );
  }

  @Get('stallion-affinity/:stallionId')
  async generateStallionAffinityReport(
    @Param('stallionId') stallionId: number,
    @Param('fullName') fullName: string,
    @Param('email') email: string,
  ) {
    return await this.reportTemplatesService.generateStallionAffinityReport(
      stallionId,
      {},
      fullName,
      email,
    );
  }

  // @Get('test')
  // async test() {
  //   return await this.reportTemplatesService.test();
  // }
}
