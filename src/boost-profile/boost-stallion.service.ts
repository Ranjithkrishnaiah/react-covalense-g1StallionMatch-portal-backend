import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { Repository } from 'typeorm';
import { CreateBoostStallionDto } from './dto/create-boost-stallion.dto';
import { BoostStallion } from './entities/boost-stallion.entity';

@Injectable({ scope: Scope.REQUEST })
export class BoostStallionService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(BoostStallion)
    private boostStallionRepository: Repository<BoostStallion>,
  ) {}

  async create(createBoostStallionDto: CreateBoostStallionDto) {
    const createOrderResponse = await this.boostStallionRepository.save(
      this.boostStallionRepository.create(createBoostStallionDto),
    );
    return createOrderResponse;
  }
}
