import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegionResponse } from './dto/region-response.dto';
import { Region } from './entities/region.entity';

@Injectable()
export class RegionsService {
  constructor(
    @InjectRepository(Region)
    private regionRepository: Repository<Region>,
  ) {}

  /* Get all regions */
  findAll(): Promise<RegionResponse[]> {
    const entities = this.regionRepository.find();
    return entities;
  }

  /* Get a region */
  findOne(id: number): Promise<RegionResponse> {
    return this.regionRepository.findOne({
      id,
    });
  }
}
