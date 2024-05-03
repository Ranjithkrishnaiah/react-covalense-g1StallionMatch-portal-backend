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
import { CartProduct } from './entities/cart-product.entity';
import { CartProductDto } from './dto/cart-product.dto';

@Injectable({ scope: Scope.REQUEST })
export class CartProductService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(CartProduct)
    private cartProductRepository: Repository<CartProduct>,
  ) {}

  // to create new cart-product with product-type at the time of add-to-cart
  async create(cartProductDto: CartProductDto) {
    const record = await this.cartProductRepository.save(
      this.cartProductRepository.create(cartProductDto),
    );
    return record;
  }

  async findAll(
    searchOptionsDto: PageOptionsDto,
  ): Promise<PageDto<CartProduct>> {
    const member = this.request.user;
    const queryBuilder = this.cartProductRepository
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

  findOne(id: number) {
    return this.cartProductRepository.find({
      id,
    });
  }

  async findByCartId(cartId: number) {
    return await this.cartProductRepository.find({
      cartId,
    });
  }

  async delete(id: number) {
    const record = await this.cartProductRepository.findOne(id);
    if (!record) {
      throw new UnprocessableEntityException('Cart Product not exist!');
    }
    const member = this.request.user;
    const response = await this.cartProductRepository.delete(id);
    return response;
  }
}
