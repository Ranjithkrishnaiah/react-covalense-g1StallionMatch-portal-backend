import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ReportProductItemsService } from './report-product-items.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Report Product Items')
@Controller({
  path: 'report-product-items',
  version: '1',
})
@Controller('report-product-items')
export class ReportProductItemsController {
  constructor(private readonly reportProductItemsService: ReportProductItemsService) {}

}
