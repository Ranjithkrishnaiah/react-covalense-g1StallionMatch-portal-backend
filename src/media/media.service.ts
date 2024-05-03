import {
  Inject,
  Injectable,
  NotFoundException,
  Scope,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Not, Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { Media } from './entities/media.entity';
import { CreateMediaInitialDto } from './dto/create-media-initial.dto';
import { CommonUtilsService } from 'src/common-utils/common-utils.service';
import { ConfigService } from '@nestjs/config';

@Injectable({ scope: Scope.REQUEST })
export class MediaService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(Media)
    private mediaRepository: Repository<Media>,
    private commonUtilsService: CommonUtilsService,
    private readonly configService: ConfigService,
  ) {}

  /* Create Media Record */
  async create(mediauuid: string) {
    const member = this.request.user;
    //For Local Development Environment
    if (this.configService.get('app.nodeEnv') == 'local') {
      let createMedia = new CreateMediaDto();
      createMedia.createdBy = member['id'];
      createMedia.mediauuid = mediauuid;
      createMedia.markForDeletion = false;
      createMedia.fileName = 'image.png';
      createMedia.mediaLocation =
        'stallion/profile-image/FCD90936-8309-ED11-B1EC-00155D01EE2B/209bb6e6-5d9f-45b4-a093-66be00d72d2e/image.png';
      createMedia.mediaUrl =
        'https://dev-stallionmatch.imgix.net/stallion/profile-image/FCD90936-8309-ED11-B1EC-00155D01EE2B/209bb6e6-5d9f-45b4-a093-66be00d72d2e/image.png';
      createMedia.mediaFileType = 'image/png';
      createMedia.mediaFileSize = 78066;
      return await this.mediaRepository.save(
        this.mediaRepository.create(createMedia),
      );
    } else {
      let createMedia = new CreateMediaInitialDto();
      createMedia.createdBy = member['id'];
      createMedia.mediauuid = mediauuid;
      createMedia.markForDeletion = false;
      return await this.mediaRepository.save(
        this.mediaRepository.create(createMedia),
      );
    }
  }

  /* Update Media Record */
  async update(mediauuid: string, updateDto: UpdateMediaDto) {
    return this.mediaRepository.update({ mediauuid: mediauuid }, updateDto);
  }

  /* Media Record - Mark for Deletion */
  async markForDeletion(mediaId: number) {
    const member = this.request.user;
    return this.mediaRepository.update(
      { id: mediaId },
      {
        markForDeletion: true,
        markForDeletionRequestBy: member['id'],
        markForDeletionRequestDate: new Date(),
      },
    );
  }

  /* Media Record - Mark for Deletion */
  async markForDeletionByMediaUuid(mediaUuid: string) {
    const member = this.request.user;
    return this.mediaRepository.update(
      { mediauuid: mediaUuid },
      {
        markForDeletion: true,
        markForDeletionRequestBy: member['id'],
        markForDeletionRequestDate: new Date(),
      },
    );
  }

  /* Get Media By uuid */
  async getMediaByUuid(mediauuid: string) {
    const record = await this.mediaRepository.findOne({ mediauuid: mediauuid });
    if (!record) {
      throw new NotFoundException('Media not exist!');
    }
    return record;
  }

  /* Validate File Uuids */
  async validateFileUuid(mediauuid: string) {
    const record = await this.mediaRepository.findOne({ mediauuid: mediauuid });
    if (record) {
      throw new UnprocessableEntityException(
        'Mediauuid already in use, try with different one!',
      );
    }
    return mediauuid;
  }

  /* Check is Media Exist */
  async isMediauuidsExist(mediauuidList: any[]) {
    let data = await this.mediaRepository
      .createQueryBuilder('media')
      .select('media.id')
      .andWhere('media.mediauuid  IN (:...mediauuidList)', {
        mediauuidList: mediauuidList,
      })
      .getCount();
    if (data) {
      throw new UnprocessableEntityException(
        'Mediauuids already in use, try with different one!',
      );
    }
    return;
  }

  /* Get Media Upload Status */
  async mediaUploadStatus(mediauuids: []) {
    const record = await this.mediaRepository.find({
      where: {
        mediauuid: In(mediauuids),
        mediaUrl: Not(IsNull()),
      },
    });
    if (mediauuids.length != record.length) {
      return 'INPROGRESS';
    }
    return 'SUCCESS';
  }
}
