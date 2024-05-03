import { Inject, Injectable, Scope, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { PageMetaDto } from 'src/utils/dtos/page-meta.dto';
import { PageOptionsDto } from 'src/utils/dtos/page-options.dto';
import { PageDto } from 'src/utils/dtos/page.dto';
import { OrderProductItemDto } from './dto/create-order-product-item.dto';
import { OrderProductItem } from './entities/order-product-item.entity';

@Injectable({ scope: Scope.REQUEST })
export class OrderProductItemsService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(OrderProductItem)
    private orderProductItemRepository: Repository<OrderProductItem>
  ) { }

  //to create new order product item
  async create(orderProductItemDto: OrderProductItemDto) {
    const record = await this.orderProductItemRepository.save(
      this.orderProductItemRepository.create(orderProductItemDto),
    );
    return record;
  }

  //to get all order product items based on loggedin member
  async findAll(
    searchOptionsDto: PageOptionsDto
  ): Promise<PageDto<OrderProductItem>> {
    const member = this.request.user;

    const queryBuilder = this.orderProductItemRepository.createQueryBuilder("cartProduct")
      .andWhere("cartProduct.createdBy=:memberId", { memberId: member['id'] })

    queryBuilder
      .orderBy("cartProduct.id", searchOptionsDto.order)
      .offset(searchOptionsDto.skip)
      .limit(searchOptionsDto.limit);

    const itemCount = await queryBuilder.getCount();
    const entities = await queryBuilder.getRawMany();

    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto: searchOptionsDto });

    return new PageDto(entities, pageMetaDto);
  }

  //hard removal of order product item based on its id
  async delete(id: number) {
    const record = await this.orderProductItemRepository.findOne(id);
    if (!record) {
      throw new UnprocessableEntityException('Cart Product items not exist!');
    }
    const response = await this.orderProductItemRepository.delete(id);
    return response;

  }

  //to get order product items based on applying dynamic conditions
  async findByEntity(entity) {
    return await this.orderProductItemRepository.find({ where: entity })
  }



}
