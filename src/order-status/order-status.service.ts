import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOrderStatusDto } from './dto/create-order-status.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderStatus } from './entities/order-status.entity';
import { Request } from 'express';
import { OrderStatusResponseDto } from './dto/order-status-response.dto';

@Injectable()
export class OrderStatusService {

  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(OrderStatus)
    private orderStatusRepository: Repository<OrderStatus>,

  ) { }

  create(createOrderStatusDto: CreateOrderStatusDto) {
    return 'This action adds a new orderStatus';
  }

  async findAll(): Promise<OrderStatusResponseDto[]> {
    return await this.orderStatusRepository.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} orderStatus`;
  }

  update(id: number, updateOrderStatusDto: UpdateOrderStatusDto) {
    return `This action updates a #${id} orderStatus`;
  }

  remove(id: number) {
    return `This action removes a #${id} orderStatus`;
  }

  //to get order status single record by statusCode
  async findOneByStatusCode(statusCode: string) {

    return await this.orderStatusRepository.findOne({

      orderStatusCode: statusCode,

    });

  }
}
