import {
  Body,
  Controller,
  ValidationPipe,
  Post,
  Get,
  Query,
  Put,
  Res,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { RegisterInterestService } from './service/register-interest.service';
import { RegisterIntrestDto } from './dto/register-intrest.dto';
import { RegisterIntrestFarmDto } from './dto/register-intrest-farm.dto';
import { EmailExistDto } from './dto/email-exist.dto';
import { UnSubscribeDto } from './dto/unsubsribe.dto';
import { ReSubscribeDto } from './dto/resubsribe.dto';
import { SubscribeDto } from './dto/subscribe.dto';
import { createReadStream } from 'fs';
import { RegisterInterestTypeService } from 'src/register-interest-types/service/register-interest-type.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Register Interest')
@Controller({
  path: 'register-interest',
  version: '1',
})
@Controller()
export class RegisterInterestController {
  constructor(
    private riService: RegisterInterestService,
    private riTypeService: RegisterInterestTypeService,
  ) {}

  @ApiOperation({
    summary: 'Add Register Interest',
  })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  })
  @Post()
  async registerIntrest(
    @Body(ValidationPipe) registerIntrestDto: RegisterIntrestDto,
  ): Promise<{ message: string }> {
    return this.riService.registerIntrest(
      registerIntrestDto,
      await this.riTypeService.getRegisterBreederInterestRoleId(),
    );
  }

  /* @Post('/farm')
  async registerIntrestFarm(
    @Body(ValidationPipe) registerIntrestFarmDto: RegisterIntrestFarmDto
  ): Promise<{ message: string }> {
    return this.riService.registerIntrestFarm(
      registerIntrestFarmDto,
      await this.riTypeService.getRegisterFarmInterestRoleId(),
    );
  } */

  @ApiOperation({
    summary: 'Check Is Register Interest Email Valid',
  })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  })
  @Get('/is-register-intrest-email-valid')
  async isBreederEmailValid(
    @Query(ValidationPipe) emailExistDto: EmailExistDto,
  ): Promise<{ message: string }> {
    return this.riService.isEmailValid(
      emailExistDto?.email,
      await this.riTypeService.getRegisterBreederInterestRoleId(),
    );
  }

  /* @Get('/is-register-intrest-farm-email-valid')
  async isFarmownerEmailValid(
    @Query(ValidationPipe) emailExistDto: EmailExistDto,
  ): Promise<{ message: string }> {
    return this.riService.isEmailValid(
      emailExistDto?.email,
      await this.riTypeService.getRegisterFarmInterestRoleId(),
    );
  } */

  @ApiOperation({
    summary: 'Insight Reports - Subscription',
  })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  })
  @Post('/insights-report')
  async subscribeForInsightsReport(
    @Body(ValidationPipe) subscribeDto: SubscribeDto,
  ): Promise<{ message: string }> {
    return this.riService.insightsReport(
      subscribeDto,
      await this.riTypeService.getSubscribeInsightsReportRoleId(),
    );
  }

  @ApiOperation({
    summary: 'Check Insight Reports - Subscription Email Valid',
  })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  })
  @Get('/is-insights-report-email-valid')
  async isInsightsReportEmailValid(
    @Query(ValidationPipe) emailExistDto: EmailExistDto,
  ): Promise<{ message: string }> {
    return this.riService.isEmailValid(
      emailExistDto?.email,
      await this.riTypeService.getSubscribeInsightsReportRoleId(),
    );
  }

  @ApiOperation({
    summary: 'Farm - Subscription',
  })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  })
  @Post('/farm-subscribe')
  async subscribeForFarm(
    @Body(ValidationPipe) subscribeDto: SubscribeDto,
  ): Promise<{ message: string }> {
    return this.riService.farm(
      subscribeDto,
      await this.riTypeService.getSubscribeFarmRoleId(),
    );
  }

  @ApiOperation({
    summary: 'Check Farm - Subscription Email Valid',
  })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  })
  @Get('/is-farm-subscribe-email-valid')
  async isFarmEmailValid(
    @Query(ValidationPipe) emailExistDto: EmailExistDto,
  ): Promise<{ message: string }> {
    return this.riService.isEmailValid(
      emailExistDto?.email,
      await this.riTypeService.getSubscribeFarmRoleId(),
    );
  }

  /* @Put('/unsubscribe')
  async unSubscribe(
    @Body(ValidationPipe) unSubscribeDto: UnSubscribeDto,
  ): Promise<{ message: string }> {
    return this.riService.unSubscribe(
      unSubscribeDto,
    );
  }

  @Put('/resubscribe')
  async reSubscribe(
    @Body(ValidationPipe) reSubscribeDto: ReSubscribeDto,
  ): Promise<{ message: string }> {
    return this.riService.reSubscribe(
      reSubscribeDto,
    );
  }

  @Get('/insights-report-download/:reportKey')
  async getInsightsReportFile(
    @Param('reportKey', new ParseUUIDPipe()) reportKey: string,
    @Res() res,
  ) {
    await this.riService.findInsightReportUser(
      reportKey,
      await this.riTypeService.getSubscribeInsightsReportRoleId(),
    );
    const filename = 'report.pdf';
    // make it to be inline other than downloading
    // res.setHeader('Content-disposition', 'attachment; filename=' + filename);
    const filestream = createReadStream('files/' + filename);
    filestream.pipe(res);
  }

  @Get('/user-record/:recordKey')
  async getUserRecord(
    @Param('recordKey', new ParseUUIDPipe()) recordKey: string
  ): Promise<{ fullName: string }> {
    return this.riService.find(
      recordKey
    );
  } */
}
