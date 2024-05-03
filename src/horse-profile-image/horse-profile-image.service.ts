import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HorseProfileImage } from './entities/horse-profile-image.entity';

@Injectable()
export class HorseProfileImageService {
  constructor(
    @InjectRepository(HorseProfileImage)
    private horseProfileImageRepository: Repository<HorseProfileImage>,
  ) {}

  /* Get Horse Image By HorseId*/
  async findByHorseId(horseId: number) {
    return await this.horseProfileImageRepository
      .createQueryBuilder('hpi')
      .select(
        'hpi.horseId, hpi.mediaId, media.fileName, media.mediaUrl, media.mediaThumbnailUrl, media.mediaShortenUrl, media.mediaFileType, media.mediaFileSize',
      )
      .innerJoin('hpi.media', 'media')
      .andWhere('hpi.horseId = :horseId', { horseId: horseId })
      .andWhere('media.markForDeletion = 0')
      .andWhere('media.mediaUrl IS NOT NULL')
      .andWhere("media.mediaUrl != ''")
      .getRawOne();
  }
}
