import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pricing } from './entities/pricing.entity';
import { Request } from 'express';

@Injectable({ scope: Scope.REQUEST })
export class PricingService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(Pricing)
    private priceRepository: Repository<Pricing>,
  ) {}

  /* Get a Record */
  findOne(fields: any) {
    return this.priceRepository.findOne({
      where: fields,
    });
  }

  /* Get a Pricing by countryCode and productCode */
  async getPricing(countryCode: string, productCode: string) {
    let data = await this.priceRepository.manager.query(
      `EXEC proc_SMPGetPricingByCountryCodeAndProductCode 
                     @countryCode=@0,
                     @productCode=@1`,
      [countryCode, productCode],
    );
    if (data.length > 0) {
      return data[0];
    }
    return null;
  }
}
