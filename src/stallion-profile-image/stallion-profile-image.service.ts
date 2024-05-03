import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProfileImageDto } from './dto/create-profile-image.dto';
import { StallionProfileImage } from './entities/stallion-profile-image.entity';

@Injectable()
export class StallionProfileImageService {
  constructor(
    @InjectRepository(StallionProfileImage)
    private stallionProfileImageRepository: Repository<StallionProfileImage>,
  ) {}

  /* Create a stallion profile image record */
  async create(createDto: CreateProfileImageDto) {
    return this.stallionProfileImageRepository.save(
      this.stallionProfileImageRepository.create(createDto),
    );
  }

  /* Get a stallion profile image by stallionId */
  async findByStallionId(stallionId: number) {
    return await this.stallionProfileImageRepository
      .createQueryBuilder('spi')
      .select(
        'spi.stallionId, spi.mediaId, media.fileName, media.mediaUrl, media.mediaThumbnailUrl, media.mediaShortenUrl, media.mediaFileType, media.mediaFileSize',
      )
      .innerJoin('spi.media', 'media')
      .andWhere('spi.stallionId = :stallionId', { stallionId: stallionId })
      .andWhere('media.markForDeletion = 0')
      .andWhere('media.mediaUrl IS NOT NULL')
      .andWhere("media.mediaUrl != ''")
      .getRawOne();
  }
}
