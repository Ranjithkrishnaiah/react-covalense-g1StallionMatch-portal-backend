import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BoostUserLocation } from './entities/boost-user-location.entity';
import { CreateBoostUserLocationDto } from './dto/create-boost-user-location.dto';

@Injectable({ scope: Scope.REQUEST })
export class BoostUserLocationService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(BoostUserLocation)
    private boostUserLocationRepository: Repository<BoostUserLocation>,
  ) {}

  async create(createBoostUserLocationDto: CreateBoostUserLocationDto) {
    const createOrderResponse = await this.boostUserLocationRepository.save(
      this.boostUserLocationRepository.create(createBoostUserLocationDto),
    );
    return createOrderResponse;
  }
}
