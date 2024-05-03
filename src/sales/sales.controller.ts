import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SalesService } from './sales.service';

@ApiTags('Sales')
@Controller({
  path: 'sale',
  version: '1',
})
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @ApiOperation({
    summary: 'Get All Sales List By Location',
  })
  @ApiOkResponse({
    description: 'Get All Sales List By Location',
  })
  @Get(':countryId')
  findSalesByLocation(@Param('countryId') countryId: string) {
    return this.salesService.findSalesByLocation({ countryId: countryId });
  }
}
