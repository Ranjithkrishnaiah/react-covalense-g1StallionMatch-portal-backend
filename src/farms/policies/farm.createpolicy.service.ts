import { InjectRepository } from '@nestjs/typeorm';
import { Farm } from '../entities/farm.entity';
import { Repository } from 'typeorm';

import { ExecutionContext } from '@nestjs/common';

export class FarmCreatePolicyService {
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
