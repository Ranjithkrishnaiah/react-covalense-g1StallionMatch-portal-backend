import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SalesLot } from './entities/sales-lot.entity';
import { SalesLotDto } from './dto/sales-lot.dto';

@Injectable()
export class SalesLotService {
  constructor(
    @InjectRepository(SalesLot)
    private salesLotRepository: Repository<SalesLot>,
  ) {}

  /*  Get Sales Lots  */
  findAll() {
    return this.salesLotRepository.find();
  }

  /*  Get All Sales Lot List By Selected Sales */
  async findBySales(salesLotDto: SalesLotDto) {
    const queryBuilder = this.salesLotRepository
      .createQueryBuilder('saleslot')
      .select('saleslot.id as salesLotId,saleslot.lotNumber as lotNumber,saleslot.horseGender as gender')
      .andWhere('saleslot.isVerified=1')
    if (salesLotDto.sales.length > 0) {
      queryBuilder.andWhere('saleslot.salesId IN (:...salesIds)', {
        salesIds: salesLotDto.sales,
      });
    }
    const entities = await queryBuilder.getRawMany();
    return entities;
  }
}
