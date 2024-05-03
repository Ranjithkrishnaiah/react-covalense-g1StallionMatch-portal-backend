import {
  Inject,
  Injectable,
  Scope,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { PageMetaDto } from 'src/utils/dtos/page-meta.dto';
import { PageOptionsDto } from 'src/utils/dtos/page-options.dto';
import { PageDto } from 'src/utils/dtos/page.dto';
import { CartProductItemDto } from './dto/create-cart-product-item.dto';
import { CartProductItem } from './entities/cart-product-item.entity';

@Injectable({ scope: Scope.REQUEST })
export class CartProductItemsService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(CartProductItem)
    private cartProductItemRepository: Repository<CartProductItem>,
  ) {}

  async create(cartProductItemDto: CartProductItemDto) {
    const record = await this.cartProductItemRepository.save(
      this.cartProductItemRepository.create(cartProductItemDto),
    );
    return record;
  }

  async findAll(
    searchOptionsDto: PageOptionsDto,
  ): Promise<PageDto<CartProductItem>> {
    const member = this.request.user;

    const queryBuilder = this.cartProductItemRepository
      .createQueryBuilder('cartProduct')
      .andWhere('cartProduct.createdBy=:memberId', { memberId: member['id'] });

    queryBuilder
      .orderBy('cartProduct.id', searchOptionsDto.order)
      .offset(searchOptionsDto.skip)
      .limit(searchOptionsDto.limit);

    const itemCount = await queryBuilder.getCount();
    const entities = await queryBuilder.getRawMany();

    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: searchOptionsDto,
    });

    return new PageDto(entities, pageMetaDto);
  }

  async findByCartProductItems(fields) {
    return await this.cartProductItemRepository.find({ where: fields });
  }

  async delete(id: number) {
    const record = await this.cartProductItemRepository.findOne(id);
    if (!record) {
      throw new UnprocessableEntityException('Cart Product items not exist!');
    }
    const response = await this.cartProductItemRepository.delete(id);
    return response;
  }

  async deleteMany(ids: number[]) {
    const response = await this.cartProductItemRepository.delete(ids);
    return response;
  }
}
