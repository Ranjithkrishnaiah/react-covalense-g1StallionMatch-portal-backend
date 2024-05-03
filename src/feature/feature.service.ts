import { Inject, Scope, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feature } from './entities/feature.entity';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { FeatureResponseDto } from './dto/feature-response.dto';

@Injectable({ scope: Scope.REQUEST })
export class FeatureService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(Feature)
    private featureRepository: Repository<Feature>,
  ) {}

  /* Get All features */
  findAll(): Promise<FeatureResponseDto[]> {
    return this.featureRepository.find();
  }

  /* Get one feature by id */
  findOne(id: number): Promise<FeatureResponseDto[]> {
    return this.featureRepository.find({ id });
  }
}
