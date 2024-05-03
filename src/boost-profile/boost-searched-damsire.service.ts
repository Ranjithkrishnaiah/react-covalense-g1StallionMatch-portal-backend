import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BoostSearchedDamSire } from './entities/boost-searched-damsire.entity';
import { CreateBoostSearchedDamsireDto } from './dto/create-boost-searched-damsire.dto';

@Injectable({ scope: Scope.REQUEST })
export class BoostSearchedDamsireService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(BoostSearchedDamSire)
    private boostSearchedDamSireRepository: Repository<BoostSearchedDamSire>,
  ) {}

  async create(createBoostSearchedDamsireDto: CreateBoostSearchedDamsireDto) {
    const createOrderResponse = await this.boostSearchedDamSireRepository.save(
      this.boostSearchedDamSireRepository.create(createBoostSearchedDamsireDto),
    );
    return createOrderResponse;
  }
}
