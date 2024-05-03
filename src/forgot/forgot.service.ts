import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial } from 'src/utils/types/deep-partial.type';
import { FindOptions } from 'src/utils/types/find-options.type';
import { LessThanOrEqual, Repository } from 'typeorm';
import { Forgot } from './entities/forgot.entity';
import { format } from 'date-fns';

@Injectable()
export class ForgotService {
  constructor(
    @InjectRepository(Forgot)
    private forgotRepository: Repository<Forgot>,
  ) {}

  async findOne(options: FindOptions<Forgot>) {
    return this.forgotRepository.findOne({
      where: options.where,
    });
  }

  async findOneByHashAndExpire(hash: string, expiredOn: Date) {
    const LessThanOrEqualDate = (date: Date) =>
      LessThanOrEqual(format(date, 'yyyy-MM-dd HH:MM:ss'));
    return this.forgotRepository.findOne({
      where: {
        hash: hash,
        expiredOn: LessThanOrEqualDate(expiredOn),
      },
    });
  }

  async findMany(options: FindOptions<Forgot>) {
    return this.forgotRepository.find({
      where: options.where,
    });
  }

  async create(data: DeepPartial<Forgot>) {
    return this.forgotRepository.save(this.forgotRepository.create(data));
  }

  async softDelete(id: number): Promise<void> {
    await this.forgotRepository.update(id, {
      deletedOn: new Date(),
    });
  }
}
