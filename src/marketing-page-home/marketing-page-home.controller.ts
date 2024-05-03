import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags
} from '@nestjs/swagger';
import { MarketingPageHomeService } from './marketing-page-home.service';

@ApiTags('Marketing Page')
@Controller({
  path: '',
  version: '1',
})
export class MarketingPageHomeController {
  constructor(
    private readonly marketingPageHomeService: MarketingPageHomeService,
  ) {}
  
  @ApiOperation({
    summary: 'Get Page Data',
  })
  @ApiOkResponse({
    description: 'Get Page Data',
  })
  @Get('page-data/:pageId')
  async findById(@Param('pageId', new ParseUUIDPipe()) pageId: string) {
    return await this.marketingPageHomeService.findByUuId(pageId);
  }
}
