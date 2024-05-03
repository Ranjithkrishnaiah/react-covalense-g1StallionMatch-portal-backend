import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { AuditEntity } from './audit.entity';
import { OnEvent } from '@nestjs/event-emitter';
import { HorsesService } from 'src/horses/horses.service';
import { StallionsService } from 'src/stallions/stallions.service';
import { FarmsService } from 'src/farms/farms.service';
import { MessageService } from 'src/messages/messages.service';
import { MembersService } from 'src/members/members.service';
import { ACTIVITY_TYPE } from 'src/utils/constants/common';
const UserAgent = require('user-agents');

@Injectable()
export class AuditService {
  stallionPromotionId: any;

  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(AuditEntity)
    private auditRepository: Repository<AuditEntity>,
    private stallionService: StallionsService,
    private farmService: FarmsService,
    private horseService: HorsesService,
    @Inject(forwardRef(() => MessageService))
    private messageService: MessageService,
    private memberService: MembersService,
  ) {}

  userAgent = new UserAgent();

  //Stallion Testimonial Add/Update.
  @OnEvent('stallionTestimonialAddandUpdate')
  async listenToStallionTestimonialAddandUpdate(data: any) {
    let createUpdateTestimonialStallion = {
      activityType: ACTIVITY_TYPE.CREATE,
      newValue: JSON.stringify(data),
      oldValue: null,
      attributeName: 'stallionTestimonialAddandUpdate',
      entityId: data.stallionUuid,
      userAgent: this.userAgent.data.userAgent,
      createdBy: data?.createdBy,
    };
    let stallion = await this.auditRepository.save(
      this.auditRepository.create(createUpdateTestimonialStallion),
    );
  }

  @OnEvent('galleryImageUpload')
  listenToImageUploadEvent(data: any) {
    let createGalleryImageUploadFarmBody = {
      activityType: ACTIVITY_TYPE.CREATE,
      newValue: JSON.stringify(data),
      oldValue: null,
      attributeName: 'galleryImageUpload',
      entityId: data.farmUuid,
      userAgent: this.userAgent.data.userAgent,
      createdBy: data?.createdBy,
    };
    let user = this.auditRepository.save(
      this.auditRepository.create(createGalleryImageUploadFarmBody),
    );
  }

  // Favourite farm
  @OnEvent('addFarmToFav')
  async listenToFavFarmEvent(data: any) {
    let farm = await this.farmService.findFarmUuid(data.farmId);
    let favFarmBody = {
      activityType: ACTIVITY_TYPE.CREATE,
      newValue: JSON.stringify(data),
      oldValue: JSON.stringify(data),
      attributeName: 'favouriteFarm',
      entityId: farm.farmUuid,
      entity: data.memberId,
      userAgent: this.userAgent.data.userAgent,
      createdBy: data?.createdBy,
    };
    let user = this.auditRepository.save(
      this.auditRepository.create(favFarmBody),
    );
  }

  @OnEvent('removeFavFarmRecord')
  async listenToRemoveFavFarmEvent(data: any) {
    let favFarmBody = {
      activityType: ACTIVITY_TYPE.DELETE,
      newValue: null,
      oldValue: JSON.stringify(data),
      attributeName: 'removeFavouriteFarm',
      entityId: data.farmUuid,
      entity: data.id,
      userAgent: this.userAgent.data.userAgent,
      createdBy: data?.createdBy,
    };
    let user = this.auditRepository.save(
      this.auditRepository.create(favFarmBody),
    );
  }

  // createStallionPomotion
  @OnEvent('createStallionPomotion')
  async listenToCreateStallionPromotion(data: any) {
    let stallionData = this.stallionService.findStallionById(data.stallionId);

    let createStallionPromotion = {
      activityType: ACTIVITY_TYPE.CREATE,
      newValue: JSON.stringify(data),
      oldValue: null,
      attributeName: 'createStallionPromotion',
      userAgent: this.userAgent.data.userAgent,
      createdBy: data?.createdBy,
      entityId: (await stallionData).stallionUuid,
    };
    let stallion = await this.auditRepository.save(
      this.auditRepository.create(createStallionPromotion),
    );
  }

  //UpdateStallionPromotion Stallion
  @OnEvent('updateStallionPromotion')
  async listenToupdateStallionPromotion(data: any) {
    let updateStallionPromotion = {
      activityType: ACTIVITY_TYPE.UPDATE,
      newValue: data.newValue,
      oldValue: data.oldValue,
      attributeName: data.key,
      entityId: this.stallionPromotionId,
    };
    let stallion = await this.auditRepository.save(
      this.auditRepository.create(updateStallionPromotion),
    );
  }

  //addStallionToFav
  @OnEvent('addStallionToFav')
  async listenToCreateStallionFavourite(data: any) {
    let stallion = await this.stallionService.findStallionById(data.stallionId);
    let createStallionFav = {
      activityType: ACTIVITY_TYPE.CREATE,
      newValue: JSON.stringify(data),
      oldValue: null,
      attributeName: 'createStallionFavourite',
      entityId: stallion.stallionUuid,
      entity: data.memberId,
      userAgent: this.userAgent.data.userAgent,
      createdBy: data?.createdBy,
    };
    let stallionResponse = await this.auditRepository.save(
      this.auditRepository.create(createStallionFav),
    );
  }

  // Remove favourite stallion
  @OnEvent('removeFavStallionRecord')
  async listenToRemoveFavStallionEvent(data: any) {
    let stallion = await this.stallionService.findStallionById(data.stallionId);
    let favFarmBody = {
      activityType: ACTIVITY_TYPE.DELETE,
      newValue: null,
      oldValue: JSON.stringify(data),
      attributeName: 'removeFavouriteStallion',
      entityId: stallion.stallionUuid,
      entity: data.memberId,
      userAgent: this.userAgent.data.userAgent,
      createdBy: data?.createdBy,
    };
    let user = this.auditRepository.save(
      this.auditRepository.create(favFarmBody),
    );
  }

  //InviteMemberToFarm
  @OnEvent('InviteMemberToFarm')
  async listenToInviteMemberToFarm(data: any) {
    let farm = await this.farmService.findFarmUuid(data.farmId);
    let favFarmBody = {
      activityType: ACTIVITY_TYPE.CREATE,
      newValue: null,
      oldValue: JSON.stringify(data),
      attributeName: 'inviteMemberToFarm',
      entityId: farm.farmUuid,
      entity: data.memberId,
      userAgent: this.userAgent.data.userAgent,
      createdBy: data?.createdBy,
    };
    let user = this.auditRepository.save(
      this.auditRepository.create(favFarmBody),
    );
  }

  //InviteMemberToFarm
  @OnEvent('updateInviteMemberToFarm')
  async listenToUpadteInviteMemberToFarm(data: any) {
    let favFarmBody = {
      newValue: data.newValue,
      oldValue: data.oldValue,
      attributeName: data.key,
    };
    let user = this.auditRepository.save(
      this.auditRepository.create(favFarmBody),
    );
  }

  //InviteMemberToFarm
  @OnEvent('unlinkMemberFromFarm')
  async listenToUnlinkMemberToFarm(data: any) {
    let unlinkMemberFarm = {
      activityType: ACTIVITY_TYPE.DELETE,
      newValue: null,
      oldValue: JSON.stringify(data.removeEvent),
      attributeName: 'unLinkmember',
      // Not storing memberId in memberInvitationID so it is going null. Bug
      entityId: data?.loadEvent?.memberId,
      entity: data?.loadEvent?.farmId,
      userAgent: this.userAgent?.data?.userAgent,
      createdBy: data?.createdBy,
    };
    let user = this.auditRepository.save(
      this.auditRepository.create(unlinkMemberFarm),
    );
  }

  // stallionCreateShortlist;
  @OnEvent('stallionCreateShortlist')
  async listenToCreateStallionShortList(data: any) {
    let stallionShorList = await this.stallionService.findStallionById(
      data.stallionId,
    );
    let createStallionPromotion = {
      activityType: ACTIVITY_TYPE.CREATE,
      newValue: JSON.stringify(data.stallionCreatePromotion),
      oldValue: null,
      attributeName: 'stallionCreateShortList',
      entityId: stallionShorList.stallionUuid,
      entity: data.id,
      userAgent: this.userAgent.data.userAgent,
      createdBy: data?.createdBy,
    };
    let stallion = await this.auditRepository.save(
      this.auditRepository.create(createStallionPromotion),
    );
  }

  // createMareRequest
  @OnEvent('createMareRequest')
  async listenToCreateMareRequest(data: any) {
    let createStallionPromotion = {
      activityType: ACTIVITY_TYPE.CREATE,
      newValue: JSON.stringify(data),
      oldValue: null,
      attributeName: 'createMareRequest',
      entityId: data.id,
      entity: data.id,
      userAgent: this.userAgent.data.userAgent,
      createdBy: data?.createdBy,
    };
    let stallion = await this.auditRepository.save(
      this.auditRepository.create(createStallionPromotion),
    );
  }

  // createMemberMare
  @OnEvent('createMemberMare')
  async listenToCreateMemberMare(data: any) {
    let createStallionPromotion = {
      activityType: ACTIVITY_TYPE.CREATE,
      newValue: JSON.stringify(data),
      oldValue: null,
      attributeName: 'createMemberMare',
      entityId: data.memberId,
      entity: data.mareId,
      userAgent: this.userAgent.data.userAgent,
      createdBy: data.createdBy,
    };
    let stallion = await this.auditRepository.save(
      this.auditRepository.create(createStallionPromotion),
    );
  }

  // favouriteMare
  @OnEvent('favouriteMare')
  async listenToFavouriteMare(data: any) {
    let createStallionPromotion = {
      activityType: ACTIVITY_TYPE.CREATE,
      newValue: JSON.stringify(data),
      oldValue: null,
      attributeName: 'favMare',
      entityId: data.memberId,
      entity: data.mareId,
      userAgent: this.userAgent.data.userAgent,
      createdBy: data.createdBy,
    };
    let stallion = await this.auditRepository.save(
      this.auditRepository.create(createStallionPromotion),
    );
  }
}
