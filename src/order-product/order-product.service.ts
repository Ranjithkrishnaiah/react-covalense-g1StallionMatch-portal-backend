import { Inject, Injectable, Scope, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { PageMetaDto } from 'src/utils/dtos/page-meta.dto';
import { PageOptionsDto } from 'src/utils/dtos/page-options.dto';
import { PageDto } from 'src/utils/dtos/page.dto';
import { OrderProduct } from './entities/order-product.entity';
import { OrderProductDto } from './dto/order-product.dto';

@Injectable({ scope: Scope.REQUEST })
export class OrderProductService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(OrderProduct)
    private orderProductRepository: Repository<OrderProduct>,
  ) {}
  
  async create(orderProductDto: OrderProductDto) {
    const record = await this.orderProductRepository.save(
      this.orderProductRepository.create(orderProductDto),
    );
    return record;
  }
  
  //to get all orders list
  async findAll(
    searchOptionsDto: PageOptionsDto
  ): Promise<PageDto<OrderProduct>> {
      const member = this.request.user;
      
      const queryBuilder = this.orderProductRepository.createQueryBuilder("orderProduct")
      .andWhere("orderProduct.createdBy=:memberId", { memberId: member['id'] })

      queryBuilder
        .orderBy("orderProduct.id", searchOptionsDto.order)
        .offset(searchOptionsDto.skip)
        .limit(searchOptionsDto.limit);
      
      const itemCount = await queryBuilder.getCount();
      const entities = await queryBuilder.getRawMany();

      const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto: searchOptionsDto });

      return new PageDto(entities, pageMetaDto);
  }

  //to get single order details
  findOne(id: number) {
    return this.orderProductRepository.find({
      id
    });
  }

  //updating order details based on dynamic conditions
  async update(conditions,attributes) {
    let result = await this.orderProductRepository.update(conditions, attributes);
    return result;
    }

  //hard removal of order based on id
  async delete(id: number) {
    const record = await this.orderProductRepository.findOne(id);
    if (!record) {
      throw new UnprocessableEntityException('Cart Product not exist!');
    }
    const response = await this.orderProductRepository.delete(id);
   return response ; 
   
  }


}
