import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HorseType } from './entities/horse-type.entity';

@Injectable()
export class HorseTypesService {
  constructor(
    @InjectRepository(HorseType)
    private horseTypeRepository: Repository<HorseType>,
  ) {}
}
