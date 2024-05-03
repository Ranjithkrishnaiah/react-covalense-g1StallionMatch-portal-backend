import {
  Inject,
  Injectable,
  NotFoundException,
  Scope
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { Repository } from 'typeorm';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { FarmMediaInfo } from './entities/farm-media-info.entity';

@Injectable({ scope: Scope.REQUEST })
export class FarmMediaInfoService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(FarmMediaInfo)
    private farmMediaInfoRepository: Repository<FarmMediaInfo>,
  ) {}
  /* Save Farm Media Information */
  async create(farmId: number, media: CreateMediaDto) {
    const member = this.request.user;
    media.createdBy = member['id'];
    let data = {
      ...media,
      farmId: farmId,
      isActive: true,
    };
    const response = await this.farmMediaInfoRepository.save(
      this.farmMediaInfoRepository.create(data),
    );
    return response;
  }
  /* Update Farm Media Information */
  async update(farmId: number, mediaId: number, media: UpdateMediaDto) {
    let record = await this.farmMediaInfoRepository.findOne({
      farmId,
      id: mediaId,
    });
    if (!record) {
      throw new NotFoundException('Farm Media not found!');
    }
    const member = this.request.user;
    media.modifiedBy = member['id'];
    let result = await this.farmMediaInfoRepository.update(
      {
        id: mediaId,
        farmId: farmId,
      },
      media,
    );
    return result;
  }
  /* Get All Farm Media Information By FarmId */
  async getAllMediaByFarmId(farmId: number) {
    const queryBuilder = this.farmMediaInfoRepository
      .createQueryBuilder('mi')
      .select(
        'mi.id as mediaInfoId, mi.title as title, mi.description as description, mi.createdOn as createdOn',
      )
      .addSelect(
        'media.mediauuid, media.fileName, media.mediaUrl, media.mediaThumbnailUrl, media.mediaShortenUrl, media.mediaFileType',
      )
      .leftJoin('mi.farmmediafile', 'mf')
      .leftJoin(
        'mf.media',
        'media',
        'media.id=mf.mediaId AND media.markForDeletion=0 AND media.fileName IS NOT NULL',
      )
      .andWhere('mi.farmId = :farmId', { farmId: farmId })
      .andWhere('mi.isActive = :isActive', { isActive: true });
    let dbList = await queryBuilder.getRawMany();

    let mediaInfoList = [];
    dbList.forEach(function (record) {
      if (!mediaInfoList[record.mediaInfoId]) {
        mediaInfoList[record.mediaInfoId] = {
          mediaInfoId: record.mediaInfoId,
          title: record.title,
          description: record.description,
          createdOn: record.createdOn,
          isDeleted: false,
          mediaInfoFiles: [],
        };
      }
      if (record.mediauuid && record.mediaUrl) {
        let mediaItem = {
          mediaInfoId: record.mediaInfoId,
          mediauuid: record.mediauuid,
          fileName: record.fileName,
          mediaUrl: record.mediaUrl,
          mediaThumbnailUrl: record.mediaThumbnailUrl,
          mediaShortenUrl: record.mediaShortenUrl,
          mediaFileType: record.mediaFileType,
          mediaFileSize: record.mediaFileSize,
        };
        mediaInfoList[record.mediaInfoId].mediaInfoFiles.push(mediaItem);
      }
    });
    let finalList = mediaInfoList.filter(function (item) {
      return item != null;
    });
    return finalList;
  }

  /* Get All Farm Media by userId */
  async getAllFarmMediaByUserFavFarms() {
    const member = this.request.user;

    const queryBuilder = this.farmMediaInfoRepository
      .createQueryBuilder('mi')
      .select(
        'mi.farmId as farmId ,mi.id as mediaInfoId, mi.title as title, mi.description as description, mi.createdOn as createdOn',
      )
      .addSelect(
        'media.mediauuid, media.fileName, media.mediaUrl, media.mediaThumbnailUrl, media.mediaShortenUrl, media.mediaFileType',
      )
      .innerJoin('mi.farm', 'farm', 'farm.isVerified=1 AND farm.isActive=1')
      .innerJoin('farm.favouritefarms', 'favfarm', 'favfarm.farmId=farm.id')
      .innerJoin('mi.farmmediafile', 'mf')
      .innerJoin(
        'mf.media',
        'media',
        'media.id=mf.mediaId AND media.markForDeletion=0 AND media.fileName IS NOT NULL',
      )
      .andWhere('favfarm.memberId = :memberId', { memberId: member['id'] })
      .andWhere('mi.isActive = :isActive', { isActive: true });
    queryBuilder.limit(6);

    let dbList = await queryBuilder.getRawMany();

    let mediaInfoList = [];
    dbList.forEach(function (record) {
      if (record.mediauuid && record.mediaUrl) {
        mediaInfoList[record.mediaInfoId] = {
          farmId: record.farmId,
          mediaInfoId: record.mediaInfoId,
          title: record.title,
          description: record.description,
          createdOn: record.createdOn,
          isDeleted: false,
          mediaInfoFiles: [],
        };

        let mediaItem = {
          mediaInfoId: record.mediaInfoId,
          mediauuid: record.mediauuid,
          fileName: record.fileName,
          mediaUrl: record.mediaUrl,
          mediaThumbnailUrl: record.mediaThumbnailUrl,
          mediaShortenUrl: record.mediaShortenUrl,
          mediaFileType: record.mediaFileType,
          mediaFileSize: record.mediaFileSize,
        };
        mediaInfoList[record.mediaInfoId].mediaInfoFiles.push(mediaItem);
      }
    });
    let finalList = mediaInfoList.filter(function (item) {
      return item != null;
    });
    return finalList;
  }
  /* Delete Media Information */
  async delete(farmId: number, mediaInfoId: number) {
    let response = await this.farmMediaInfoRepository.findOne({
      id: mediaInfoId,
      farmId: farmId,
      isActive: true,
    });
    if (!response) {
      throw new NotFoundException('Farm Media not found!');
    }
    const member = this.request.user;
    const record = await this.farmMediaInfoRepository.findOne({
      id: mediaInfoId,
      farmId: farmId,
    });
    record.isActive = false;
    record.deletedBy = member['id'];
    record.save();
    return record;
  }
}
