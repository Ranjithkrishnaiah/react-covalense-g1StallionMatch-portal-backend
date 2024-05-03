import { Inject, Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { FarmMediaFile } from './entities/farm-media-file.entity';

@Injectable({ scope: Scope.REQUEST })
export class FarmMediaFilesService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(FarmMediaFile)
    private farmMediaFileRepository: Repository<FarmMediaFile>,
  ) {}
  /*  Add Media file */
  async create(mediaInfoId: number, mediaId: number) {
    return this.farmMediaFileRepository.save(
      this.farmMediaFileRepository.create({
        mediaInfoId: mediaInfoId,
        mediaId: mediaId,
      }),
    );
  }
}
