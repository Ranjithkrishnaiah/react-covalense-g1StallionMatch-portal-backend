import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Stallion } from 'src/stallions/entities/stallion.entity';
import { getRepository, Repository } from 'typeorm';
import { CurrencyRate } from './entities/currency-rate.entity';

@Injectable()
export class CurrencyRateService {
  constructor(
    @InjectRepository(CurrencyRate)
    private currencyRateRepository: Repository<CurrencyRate>,
  ) {}

  /* Get All currency rates */
  findAll() {
    return this.currencyRateRepository.find();
  }

  /* Get currency rate by currencyCode */
  async findOne(currencyCode: string) {
    let data = await this.currencyRateRepository.find({
      currencyCode,
    });
    if (data.length > 0) {
      return data[0];
    }
    return;
  }
}
