import { Inject, Injectable, Scope } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FarmAuditEntity } from './farm-audit.entity';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { ACTIVITY_TYPE } from 'src/utils/constants/common';
const UserAgent = require('user-agents');

@Injectable({ scope: Scope.REQUEST })
export class FarmAuditService {
  constructor(
    @InjectRepository(FarmAuditEntity)
    private farmAuditRepository: Repository<FarmAuditEntity>,
    @Inject(REQUEST) private readonly request: Request,
  ) {}

  userAgent = new UserAgent();
  gotUserAgentIp: any;

  getIpAddress(request) {
    this.gotUserAgentIp = request;
    return this.gotUserAgentIp;
  }

  //Create Farm
  @OnEvent('createFarm')
  listenToCreateFarmEvent(data: any) {
    let createFarmRequestBody = {
      activityType: ACTIVITY_TYPE.CREATE,
      newValue: JSON.stringify(data),
      oldValue: null,
      attributeName: 'createFarm',
      entityId: data.farmUuid,
      userAgent: this.userAgent.data.userAgent,
      createdBy: data?.createdBy,
    };
    let user = this.farmAuditRepository.save(
      this.farmAuditRepository.create(createFarmRequestBody),
    );
  }

  // Update farm
  @OnEvent('updateAuditFarm')
  listenToUpdateEvent(data: any) {
    let createFarmRequestBody = {
      activityType: ACTIVITY_TYPE.UPDATE,
      newValue: data.newValue,
      oldValue: data.oldValue,
      attributeName: data.key,
      entityId: data?.farmUuid,
      userAgent: this.userAgent.data.userAgent,
      createdBy: data?.createdBy,
    };
    let user = this.farmAuditRepository.save(
      this.farmAuditRepository.create(createFarmRequestBody),
    );
  }

  // Delete farm
  @OnEvent('deleteFarm')
  listenToDeleteFarmEvent(data: any) {
    let deleteFarmRequestBody = {
      activityType: ACTIVITY_TYPE.DELETE,
      newValue: null,
      oldValue: JSON.stringify(data.entity),
      attributeName: 'deleteFarm',
      entityId: data.farmUuid,
    };
    let user = this.farmAuditRepository.save(
      this.farmAuditRepository.create(deleteFarmRequestBody),
    );
  }
}
