import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateStallionLocationDto } from './dto/create-stallion-location.dto';
import { UpdateStallionLocationDto } from './dto/update-stallion-location.dto';
import { StallionLocation } from './entities/stallion-location.entity';

@Injectable()
export class StallionLocationsService {
  constructor(
    @InjectRepository(StallionLocation)
    private stallionLocationRepository: Repository<StallionLocation>,
  ) {}

  /* Create a record */
  async create(createStallionLocationDto: CreateStallionLocationDto) {
    return this.stallionLocationRepository.save(
      this.stallionLocationRepository.create(createStallionLocationDto),
    );
  }

  /* Update a record */
  async update(
    id: number,
    updateStallionLocationDto: UpdateStallionLocationDto,
  ) {
    return this.stallionLocationRepository.update(
      { stallionId: id },
      updateStallionLocationDto,
    );
  }
}
