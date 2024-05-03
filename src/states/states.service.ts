import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { State } from './entities/state.entity';
import { StateResponseDto } from './dto/state-response.dto';

@Injectable()
export class StatesService {
  constructor(
    @InjectRepository(State)
    private statesRepository: Repository<State>,
  ) {}
  /* Get all States */
  async findAll(): Promise<StateResponseDto[]> {
    const entities: any = await this.statesRepository.find({
      relations: ['country'],
      where: {
        isDisplay: true,
      },
    });
    return entities;
  }

  /* Get all States by countryId */
  findAllByCountryId(id: number): Promise<StateResponseDto[]> {
    const entities: any = this.statesRepository.find({
      relations: ['country'],
      where: {
        country: {
          id: id,
        },
        isDisplay: true,
      },
    });
    return entities;
  }

  /* Get State by id */
  findOne(id: number) {
    return this.statesRepository.find({
      id,
    });
  }
}
