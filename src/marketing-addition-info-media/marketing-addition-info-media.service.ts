import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { MediaService } from 'src/media/media.service';
import { Repository } from 'typeorm';
import { MarketingAdditionInfoMedia } from './entities/marketing-addition-info-media.entity';

@Injectable()
export class MarketingAdditionInfoMediaService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(MarketingAdditionInfoMedia)
    private marketingAdditionInfoMediaRepository: Repository<MarketingAdditionInfoMedia>,
    private readonly mediaService: MediaService,
  ) {}
}
