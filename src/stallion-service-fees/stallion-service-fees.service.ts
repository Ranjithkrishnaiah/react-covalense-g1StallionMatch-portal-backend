import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateStallionServiceFeeDto } from './dto/create-stallion-service-fee.dto';
import { UpdateStallionServiceFeeDto } from './dto/update-stallion-service-fee.dto';
import { StallionServiceFee } from './entities/stallion-service-fee.entity';

@Injectable()
export class StallionServiceFeesService {
  constructor(
    @InjectRepository(StallionServiceFee)
    private stallionServiceFeeRepository: Repository<StallionServiceFee>,
  ) {}

  /* Create Service Fee For a Stallion */
  async create(createDto: CreateStallionServiceFeeDto) {
    return this.stallionServiceFeeRepository.save(
      this.stallionServiceFeeRepository.create(createDto),
    );
  }

  /* Update Service Fee For a Stallion */
  async update(id: number, updateDto: UpdateStallionServiceFeeDto) {
    return this.stallionServiceFeeRepository.update(
      { stallionId: id },
      updateDto,
    );
  }

  /* Get Latest Service Fee For a Stallion For a Given Year */
  async getLatestServiceFeeByYear(stallionId: number, feeYear: number) {
    let queryBuilder = await this.stallionServiceFeeRepository
      .createQueryBuilder('ssf')
      .select('ssf.feeYear, ssf.currencyId, ssf.fee, ssf.isPrivateFee')
      .andWhere('ssf.stallionId = :stallionId', { stallionId: stallionId })
      .andWhere('ssf.feeYear = :feeYear', { feeYear: feeYear })
      .orderBy('ssf.id', 'DESC')
      .limit(1);
    const itemCount = await queryBuilder.getCount();
    if (!itemCount) {
      throw new NotFoundException('No records found!');
    }
    return await queryBuilder.getRawOne();
  }
}
