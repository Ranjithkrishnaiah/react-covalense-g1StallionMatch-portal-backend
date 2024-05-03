import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProfileImageDto } from './dto/create-profile-image.dto';
import { FarmProfileImage } from './entities/farm-profile-image.entity';

@Injectable()
export class FarmProfileImageService {
  constructor(
    @InjectRepository(FarmProfileImage)
    private farmProfileImageRepository: Repository<FarmProfileImage>,
  ) {}

  /* Create  Farm Profile Image */
  async create(createDto: CreateProfileImageDto) {
    return this.farmProfileImageRepository.save(
      this.farmProfileImageRepository.create(createDto),
    );
  }

  /* Get  Farm Profile Image By FarmId*/
  async findByFarmId(farmId: number) {
    return await this.farmProfileImageRepository
      .createQueryBuilder('fpi')
      .select(
        'fpi.farmId, fpi.mediaId, media.fileName, media.mediaUrl, media.mediaThumbnailUrl, media.mediaShortenUrl, media.mediaFileType, media.mediaFileSize',
      )
      .innerJoin('fpi.media', 'media')
      .andWhere('fpi.farmId = :farmId', { farmId: farmId })
      .andWhere('media.markForDeletion = 0')
      .andWhere('media.mediaUrl IS NOT NULL')
      .andWhere("media.mediaUrl != ''")
      .getRawOne();
  }
}
