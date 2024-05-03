import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CurrencyResponseDto } from './dto/currency-response.dto';
import { Currency } from './entities/currency.entity';

@Injectable()
export class CurrenciesService {
  constructor(
    @InjectRepository(Currency)
    private currencyRepository: Repository<Currency>,
  ) {}

  /* Get All currencies */
  async findAll(): Promise<CurrencyResponseDto[]> {
    return this.currencyRepository.find();
    
  }

  /* Get Currency By Id */
  async findOne(id: number): Promise<CurrencyResponseDto> {
    let data = await this.currencyRepository.find({
      id,
    });
    if (data.length > 0) {
      return data[0];
    }
    return;
  }

  /* Get CurrencyRate by CurrencyId */
  async findCurrencyRateByCurrencyId(id: number) {
    const queryBuilder = this.currencyRepository
      .createQueryBuilder('currency')
      .select('currencyRate.rate, currencyRate.currencyCode,currency.currencySymbol,currency.id as currencyId')
      .innerJoin(
        'tblCurrencyRate',
        'currencyRate',
        'currencyRate.currencyCode=currency.currencyCode',
      )
      .andWhere('currency.id = :id', { id: id });

    let data = await queryBuilder.getRawOne();
    if (!data) {
      return;
    }
    return data;
  }
}
