import { Inject, Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { StallionGalleryImage } from './entities/stallion-gallery-image.entity';

@Injectable({ scope: Scope.REQUEST })
export class StallionGalleryImageService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(StallionGalleryImage)
    private stallionGalleryImageRepository: Repository<StallionGalleryImage>,
    private readonly configService: ConfigService,
  ) {}

  /* Get all stallion gallery images */
  async getAllStallionGalleryImages(stallionId: number) {
    return await this.findByStallionId(stallionId);
  }

  /* Get one stallion gallery images record */
  async findOne(stallionId: number, gallImgId: number) {
    return await this.stallionGalleryImageRepository.find({
      id: gallImgId,
      stallionId: stallionId,
    });
  }

  /* Get stallion gallery images count by stallionId */
  async getImagesCountByStallionId(stallionId: number) {
    return await this.stallionGalleryImageRepository
      .createQueryBuilder('sgi')
      .select(
        'sgi.stallionId, sgi.mediaId, media.fileName, media.mediauuid, media.mediaLocation, media.mediaUrl, media.mediaThumbnailUrl, media.mediaShortenUrl, media.mediaFileType, media.mediaFileSize',
      )
      .innerJoin('sgi.media', 'media')
      .andWhere('sgi.stallionId = :stallionId', { stallionId: stallionId })
      .andWhere('media.markForDeletion = 0')
      .andWhere('media.mediaUrl IS NOT NULL')
      .andWhere("media.mediaUrl != ''")
      .getCount();
  }

  /* Get all stallion gallery images for a stallion */
  async findByStallionId(stallionId: number) {
    return await this.stallionGalleryImageRepository
      .createQueryBuilder('sgi')
      .select(
        'media.mediauuid, media.fileName, media.mediaUrl, media.mediaThumbnailUrl, media.mediaShortenUrl',
      )
      .addSelect('sgi.imagePosition as position')
      .innerJoin('sgi.media', 'media')
      .andWhere('sgi.stallionId = :stallionId', { stallionId: stallionId })
      .andWhere('media.markForDeletion = 0')
      .andWhere('media.mediaUrl IS NOT NULL')
      .andWhere("media.mediaUrl != ''")
      .orderBy('sgi.imagePosition', 'ASC')
      .getRawMany();
  }

  /* Create a stallion gallery images */
  async create(stallionId: number, mediaId: number, position: number) {
    return this.stallionGalleryImageRepository.save(
      this.stallionGalleryImageRepository.create({
        stallionId: stallionId,
        mediaId: mediaId,
        imagePosition: position,
      }),
    );
  }
}
