import { InjectRepository } from '@nestjs/typeorm';
import { Farm } from '../entities/farm.entity';
import { LessThan, Repository } from 'typeorm';
import { Request } from 'express';

import { ExecutionContext, UnauthorizedException } from '@nestjs/common';

export class FarmSearchPolicyService {
  constructor(
    @InjectRepository(Farm)
    private farmsRepository: Repository<Farm>,
  ) {}
  async validate(context: ExecutionContext) {
    try {
    } catch (error) {
      throw error;
    }
  }
}
