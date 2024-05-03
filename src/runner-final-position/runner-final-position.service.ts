import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { FinalPosition } from './entities/runner-final-position.entity';

@Injectable()
export class RunnerFinalPositionService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(FinalPosition)
    private finalPositionRepository: Repository<FinalPosition>,
  ) {}
}
