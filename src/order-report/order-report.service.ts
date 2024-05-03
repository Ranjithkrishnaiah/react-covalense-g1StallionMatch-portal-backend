import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOrderReportDto } from './dto/create-order-report.dto';
import { UpdateOrderReportDto } from './dto/update-order-report.dto';
import { OrderReport } from './entities/order-report.entity';

@Injectable({ scope: Scope.REQUEST })
export class OrderReportService {

  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(OrderReport)
    private orderReportRepository: Repository<OrderReport>,
  ) {

  }

  //to create order report 
  async create(createOrderReportDto: CreateOrderReportDto) {
    let orderReportData = new OrderReport();
    orderReportData.orderProductId = createOrderReportDto.orderProductId;
    orderReportData.orderStatusId = createOrderReportDto.orderStatusId;
    orderReportData.createdBy = createOrderReportDto.createdBy;
    const createOrderResponse = await this.orderReportRepository.save(
      this.orderReportRepository.create(orderReportData),
    );
  }

  findAll() {
    return `This action returns all orderReport`;
  }

  findOne(id: number) {
    return `This action returns a #${id} orderReport`;
  }

  update(id: number, updateOrderReportDto: UpdateOrderReportDto) {
    return `This action updates a #${id} orderReport`;
  }

  remove(id: number) {
    return `This action removes a #${id} orderReport`;
  }

}
