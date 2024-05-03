import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { OrderReportService } from './order-report.service';
import { CreateOrderReportDto } from './dto/create-order-report.dto';
import { UpdateOrderReportDto } from './dto/update-order-report.dto';

@Controller('order-report')
export class OrderReportController {
  constructor(private readonly orderReportService: OrderReportService) {}

  // @Post()
  // create(@Body() createOrderReportDto: CreateOrderReportDto) {
  //   return this.orderReportService.create(createOrderReportDto);
  // }

  // @Get()
  // findAll() {
  //   return this.orderReportService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.orderReportService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateOrderReportDto: UpdateOrderReportDto) {
  //   return this.orderReportService.update(+id, updateOrderReportDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.orderReportService.remove(+id);
  // }
}
