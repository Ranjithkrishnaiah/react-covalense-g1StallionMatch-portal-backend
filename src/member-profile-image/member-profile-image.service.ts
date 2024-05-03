import { Inject, Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MemberProfileImage } from './entities/member-profile-image.entity';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

@Injectable({ scope: Scope.REQUEST })
export class MemberProfileImageService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(MemberProfileImage)
    private memberProfileImageRepository: Repository<MemberProfileImage>,
  ) {}

  async getAllMemberProfileImages(memberId: number) {
    return await this.findByMemberId(memberId);
  }

  /* Get Member Profile Image By memeberId  */
  async findByMemberId(memberId: number) {
    return await this.memberProfileImageRepository
      .createQueryBuilder('mpi')
      .select(
        'mpi.memberId, mpi.mediaId, media.fileName, media.mediaUrl, media.mediaThumbnailUrl, media.mediaShortenUrl, media.mediaFileType, media.mediaFileSize',
      )
      .innerJoin('mpi.media', 'media')
      .andWhere('mpi.memberId = :memberId', { memberId: memberId })
      .andWhere('media.markForDeletion = 0')
      .andWhere('media.mediaUrl IS NOT NULL')
      .andWhere("media.mediaUrl != ''")
      .getRawOne();
  }
  /* Create Member profile image */
  async create(mediaId: number) {
    const member = this.request.user;
    return this.memberProfileImageRepository.save(
      this.memberProfileImageRepository.create({
        memberId: member['id'],
        mediaId: mediaId,
      }),
    );
  }
}
