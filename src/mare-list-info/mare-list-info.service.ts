import { MareListInfo } from 'src/mare-list-info/entities/mare-list-info.entity';
import {
  Inject,
  Injectable,
  Scope,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

@Injectable({ scope: Scope.REQUEST })
export class MaresListInfoService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(MareListInfo)
    private mareListInfoRepository: Repository<MareListInfo>,
  ) {}

  /* Get Marelisr by maresListUuid */
  async findMareList(maresListUuid) {
    const record = await this.mareListInfoRepository.findOne({
      maresListUuid: maresListUuid,
    });
    if (!record) {
      throw new UnprocessableEntityException('Mare not exist!');
    }
    return record;
  }
}
