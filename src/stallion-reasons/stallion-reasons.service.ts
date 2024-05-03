import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StallionReason } from './entities/stallion-reasons.entity';

@Injectable()
export class StallionReasonsService {
  constructor(
    @InjectRepository(StallionReason)
    private stallionReasonRepository: Repository<StallionReason>,
  ) {}

  /* Get all stallion remove reasons */
  findAll() {
    return this.stallionReasonRepository.find();
  }

  /* Get one stallion remove reason */
  async findOneReason(fields) {
    let record = await this.stallionReasonRepository.findOne({ where: fields });
    if (!record) {
      throw new NotFoundException('Stallion Reason not found');
    }
    return record;
  }
}
