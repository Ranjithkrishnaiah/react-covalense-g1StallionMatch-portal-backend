import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sale } from './entities/sale.entity';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale)
    private saleRepository: Repository<Sale>,
  ) {}

  /* Get list of sales countrywise */

  async findSalesByLocation(fields) {
    let list = fields.countryId.split(',');
    console.log("===list",list)
    const queryBuilder = this.saleRepository
      .createQueryBuilder('sale')
      .select(
        'sale.id as saleId, sale.salesName as salesName, sale.salesCode as salesCode',
      );
    if (fields.countryId) {
      // queryBuilder.andWhere('sale.countryId=:countryId', {
      //   countryId: fields.countryId,
      // });
      queryBuilder.andWhere('sale.countryId  IN (:...list)', {
        list: list
      })
      .andWhere('sale.isActive =:isActive',{isActive:1})

    }
    const entities = await queryBuilder.getRawMany();
    return entities;

  }
}
