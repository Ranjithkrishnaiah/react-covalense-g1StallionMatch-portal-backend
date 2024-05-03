import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SocialShareType } from './entities/social-share-type.entity';
import { SocialShareTypeResponse } from './dto/social-share-type-response.dto';

@Injectable()
export class SocialShareTypeService {
  constructor(
    @InjectRepository(SocialShareType)
    private socialShareTypeRepository: Repository<SocialShareType>,
  ) {}

  /* Get all social share types */
  async findAll(): Promise<SocialShareTypeResponse[]> {
    const entities = await this.socialShareTypeRepository.find();
    let result = [];
    entities.map(function name(record) {
      result.push({
        id: record.id,
        socialShareType: record.socialShareType,
      });
    });
    return result;
  }

  /* Get a social share type */
  async findOne(id: number): Promise<SocialShareTypeResponse> {
    return await this.socialShareTypeRepository.findOne({
      id,
    });
  }

  /* Get a social share type by type */
  async findOneByType(
    socialShareType: string,
  ): Promise<SocialShareTypeResponse> {
    const record = await this.socialShareTypeRepository.findOne({
      socialShareType,
    });
    if (!record) {
      throw new UnprocessableEntityException('Social share type not exist!');
    }
    return record;
  }
}
