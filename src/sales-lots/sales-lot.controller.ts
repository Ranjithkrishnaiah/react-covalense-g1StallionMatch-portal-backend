import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SalesLotService } from './sales-lot.service';
import { SalesLotDto } from './dto/sales-lot.dto';

@ApiTags('Sales Lot')
@Controller({
  path: 'sales-lot',
  version: '1',
})
export class SalesLotController {
  constructor(private readonly salesLotService: SalesLotService) {}

  @ApiOperation({
    summary: 'Get Sales Lots',
  })
  @ApiOkResponse({
    description: '',
  })
  @Get()
  findAll() {
    return this.salesLotService.findAll();
  }

  @ApiOperation({
    summary: 'Get All Sales Lot List By Selected Sales',
  })
  @ApiOkResponse({
    description: 'Get All Sales Lot List By Selected Sales',
  })
  @Post('/by-sales')
  findBySales(@Body() salesLotDto: SalesLotDto) {
    return this.salesLotService.findBySales(salesLotDto);
  }
}
