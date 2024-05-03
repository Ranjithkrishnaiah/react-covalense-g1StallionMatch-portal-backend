import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FarmAccessLevelResponse } from './dto/farm-access-level-response.dto';
import { FarmAccessLevel } from './entities/farm-access-level.entity';

@Injectable()
export class FarmAccessLevelsService {
  constructor(
    @InjectRepository(FarmAccessLevel)
    private farmAccessLevelRepository: Repository<FarmAccessLevel>,
  ) {}
  /* Get Farm Access Level by Id */
  async findOne(id: number) {
    return await this.farmAccessLevelRepository.findOne({
      where: { id: id },
    });
  }
  /* Get All Farm Access Levels */
  async getAllAccessLevels(): Promise<FarmAccessLevelResponse[]> {
    const queryBuilder = this.farmAccessLevelRepository
      .createQueryBuilder('access')
      .select('access.id as id, access.accessName as accessName');
    return queryBuilder.getRawMany();
  }
}
