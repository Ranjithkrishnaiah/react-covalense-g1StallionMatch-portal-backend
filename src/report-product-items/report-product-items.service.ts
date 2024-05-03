import { Inject, Injectable } from '@nestjs/common';
import { CreateReportProductItemDto } from './dto/create-report-product-item.dto';
import { UpdateReportProductItemDto } from './dto/update-report-product-item.dto';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { ReportProductItem } from './entities/report-product-item.entity';
import { Repository } from 'typeorm';
import { Request } from 'express';

@Injectable()
export class ReportProductItemsService {
  
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(ReportProductItem)
    private reportProductItemRepository: Repository<ReportProductItem>
  ) { }
  
  //to create new order product item
  async create(reportProductItemDto: CreateReportProductItemDto) {
    const record = await this.reportProductItemRepository.save(
      this.reportProductItemRepository.create(reportProductItemDto),
    );
    return record;
  }
  
  update(id: number, updateReportProductItemDto: UpdateReportProductItemDto) {
    return `This action updates a #${id} reportProductItem`;
  }
}
