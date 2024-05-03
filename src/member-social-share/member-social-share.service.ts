import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import * as requestIp from 'request-ip';
import { MemberSocialShare } from './entities/member-social-share.entity';
import { CreateActualDto } from './dto/create-actual.dto';
import { SocialShareTypeService } from 'src/social-share-types/social-share-type.service';

@Injectable({ scope: Scope.REQUEST })
@Injectable()
export class MemberSocialShareService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(MemberSocialShare)
    private memberSocialShareRepository: Repository<MemberSocialShare>,
    private socialShareTypeService: SocialShareTypeService,
  ) {}

  /* Capture Stallion Social Share */
  async createInit(entityId, entityType, socialShareTypeId) {
    let ssId = await this.socialShareTypeService.findOneByType(
      socialShareTypeId,
    );
    let data = {
      entityId,
      entityType,
      socialShareTypeId: ssId.id,
    };
    await this.create(data);
  }
  /* Save Member Social Share Information */
  async create(data: CreateActualDto) {
    const member = this.request.user;
    data.userAgent = this.request.headers['user-agent'];
    data.ipAddress = requestIp.getClientIp(this.request);
    if (member) {
      data.createdBy = member['id'];
    }
    return this.memberSocialShareRepository.save(
      this.memberSocialShareRepository.create(data),
    );
  }
}
