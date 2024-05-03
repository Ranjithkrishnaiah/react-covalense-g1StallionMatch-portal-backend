import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StallionAuditEntity } from './stallion-audit.entity';
import { Request } from 'express';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ACTIVITY_TYPE } from 'src/utils/constants/common';
const UserAgent = require('user-agents');

@Injectable({ scope: Scope.REQUEST })
export class StallionAuditService {
  userAgent = new UserAgent();
  constructor(
    @InjectRepository(StallionAuditEntity)
    private stallionAuditRepository: Repository<StallionAuditEntity>,
    private eventEmitter: EventEmitter2,
    @Inject(REQUEST) private readonly request: Request,
  ) {}

  //Create Stallion
  @OnEvent('createStallion')
  async listenToCreateStallionEvent(data: any) {
    // store the event/ Like create farm. farmEntityType,
    let createFarmRequestBody = {
      activityType: ACTIVITY_TYPE.CREATE,
      newValue: JSON.stringify(data),
      oldValue: null,
      attributeName: 'createStallion',
      entityId: data.stallionUuid,
      userAgent: this.userAgent.data.userAgent,
      createdBy: data?.createdBy,
    };
    let stallion = await this.stallionAuditRepository.save(
      this.stallionAuditRepository.create(createFarmRequestBody),
    );

    let createStallionBody = {
      activityType: ACTIVITY_TYPE.UPDATE,
      newValue: stallion['newValue'],
      oldValue: stallion['oldValue'],
      key: stallion['entityId'],
      userAgent: this.userAgent.data.userAgent,
      createdBy: data?.createdBy,
    };
    this.eventEmitter.emit('updateAuditFarm', createStallionBody);
  }

  @OnEvent('deletedStallion')
  async listenToDeleteStallionEvent(data: any) {
    let deleteStallionData = {
      activityType: ACTIVITY_TYPE.DELETE,
      newValue: null,
      oldValue: JSON.stringify(data.originalEntity),
      attributeName: '',
      entityId: data.deleteStallion.stallionUuid,
      userAgent: this.userAgent.data.userAgent,
      createdBy: data?.createdBy,
    };
    let stallion = await this.stallionAuditRepository.save(
      this.stallionAuditRepository.create(deleteStallionData),
    );
  }
}
