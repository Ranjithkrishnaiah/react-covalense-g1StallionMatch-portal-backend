import { Inject, Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { FarmGalleryImage } from './entities/farm-gallery-image.entity';

@Injectable({ scope: Scope.REQUEST })
export class FarmGalleryImageService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(FarmGalleryImage)
    private farmGalleryImageRepository: Repository<FarmGalleryImage>,
  ) {}
  /* Get All Farm Gallery Images */
  async getAllFarmGalleryImages(farmId: number) {
    return await this.findByFarmId(farmId);
  }

  /* Get Gallery Images Count by FarmId*/
  async getImagesCountByFarmId(farmId: number) {
    return await this.farmGalleryImageRepository
      .createQueryBuilder('fgi')
      .select(
        'fgi.farmId, fgi.mediaId, media.fileName, media.mediauuid, media.mediaLocation, media.mediaUrl, media.mediaThumbnailUrl, media.mediaShortenUrl, media.mediaFileType, media.mediaFileSize',
      )
      .innerJoin('fgi.media', 'media')
      .andWhere('fgi.farmId = :farmId', { farmId: farmId })
      .andWhere('media.markForDeletion = 0')
      .andWhere('media.mediaUrl IS NOT NULL')
      .andWhere("media.mediaUrl != ''")
      .getCount();
  }
  /* Get All Farm Gallery Images By farmId*/
  async findByFarmId(farmId: number) {
    return await this.farmGalleryImageRepository
      .createQueryBuilder('fgi')
      .select(
        'media.mediauuid, media.fileName, media.mediaUrl, media.mediaThumbnailUrl, media.mediaShortenUrl',
      )
      .innerJoin('fgi.media', 'media')
      .andWhere('fgi.farmId = :farmId', { farmId: farmId })
      .andWhere('media.markForDeletion = 0')
      .andWhere('media.mediaUrl IS NOT NULL')
      .andWhere("media.mediaUrl != ''")
      .getRawMany();
  }
  /* Create Gallery Images */
  async create(farmId: number, mediaId: number) {
    return this.farmGalleryImageRepository.save(
      this.farmGalleryImageRepository.create({
        farmId: farmId,
        mediaId: mediaId,
      }),
    );
  }
}
