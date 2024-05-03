import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import * as requestIp from 'request-ip';
import { CreatePageViewDto } from './dto/create-page-view.dto';
import { PageView } from './entities/page-view.entity';

@Injectable({ scope: Scope.REQUEST })
@Injectable()
export class PageViewService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(PageView)
    private pageViewRepository: Repository<PageView>,
  ) {}

  /* Create a Record */
  async createInit(entityId, entityType, referrer, countryName='') {
    let PagesearchData = new CreatePageViewDto();
    PagesearchData.entityId = entityId;
    PagesearchData.entityType = entityType;
    PagesearchData.referrer = referrer;
    PagesearchData.countryName = countryName
    await this.create(PagesearchData);
  }

  /* Create a Record */
  async create(createPageView: CreatePageViewDto) {
    const member = this.request.user;
    const ipAddress = requestIp.getClientIp(this.request);
    createPageView.userAgent = this.request.headers['user-agent'];
    createPageView.ipAddress = ipAddress;
    if (member) {
      createPageView.createdBy = member['id'];
    }
    return this.pageViewRepository.save(
      this.pageViewRepository.create(createPageView),
    );
  }
}
