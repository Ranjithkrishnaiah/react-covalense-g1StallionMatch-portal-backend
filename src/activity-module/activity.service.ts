import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { CommonUtilsService } from 'src/common-utils/common-utils.service';
import { CountryService } from 'src/country/service/country.service';
import { FarmsService } from 'src/farms/farms.service';
import { HorsesService } from 'src/horses/horses.service';
import { MaresListInfoService } from 'src/mare-list-info/mare-list-info.service';
import { MemberAddressService } from 'src/member-address/member-address.service';
import { MembersService } from 'src/members/members.service';
import { MessageChannelService } from 'src/message-channel/message-channel.service';
import { MessageService } from 'src/messages/messages.service';
import { NominationRequestService } from 'src/nomination-request/nomination-request.service';
import { PaymentMethodsService } from 'src/payment-methods/payment-methods.service';
import { StallionReasonsService } from 'src/stallion-reasons/stallion-reasons.service';
import { StallionsService } from 'src/stallions/stallions.service';
import { Repository, getRepository } from 'typeorm';
import { ActivityEntity } from './activity.entity';
import { ConfigService } from '@nestjs/config';
import { MemberInvitationsService } from 'src/member-invitations/member-invitations.service';
import { FarmAccessLevelsService } from 'src/farm-access-levels/farm-access-levels.service';
import * as requestIp from 'request-ip';
import { ActivityType } from './activity-type.entity';
import { activityTypes } from 'src/utils/constants/activity';
import { Order } from 'src/orders/entities/order.entity';
import { Stallion } from 'src/stallions/entities/stallion.entity';

@Injectable()
export class ActivityService {
  testimonialDeleted: boolean = false;
  paymentMethod: any = [];
  stallionData: any;
  baseUrl = this.configService.get('file.systemActivityAdminDomain');

  constructor(
    @InjectRepository(ActivityEntity)
    private activityRepository: Repository<ActivityEntity>,
    private membersService: MembersService,
    private horseService: HorsesService,
    private stallionsService: StallionsService,
    private farmService: FarmsService,
    public mareListInfoService: MaresListInfoService,
    private nominationRequestService: NominationRequestService,
    private commonUtilsService: CommonUtilsService,
    private messageChannelService: MessageChannelService,
    private messageService: MessageService,
    private memberAddressService: MemberAddressService,
    private countryService: CountryService,
    private readonly stallionReasonsService: StallionReasonsService,
    private paymentTypeService: PaymentMethodsService,
    readonly configService: ConfigService,
    private memberInvitationService: MemberInvitationsService,
    private farmAccessLevelId: FarmAccessLevelsService,
  ) {}

  @OnEvent('stallionProfileImage')
  async stallionProfileImageActivity(data) {
    let user = await this.membersService.findOneForActivityBymemberId(
      data.originalData.user.id,
    );
    let stallion = this.stallionsService.getStallionByUuid(
      data.originalData.params.stallionId,
    );
    let horse = this.horseService.findHorseById((await stallion).horseId);
    let horseName = await this.commonUtilsService.toTitleCase(
      (
        await horse
      ).horseName,
    );

    let routeLink = `${this.baseUrl}/horsedetails/data/${horseName}/horsefilter`;
    let userRouteLink = `${this.baseUrl}/members/data/${
      (await user).fullName
    }/userFilter`;

    let stallionProfile = `<a href="${userRouteLink}" class="systemTooltip">${
      (await user).fullName
    }</a> added a new profile image for <a href="${routeLink}" class="systemTooltip">${await this.commonUtilsService.toTitleCase(
      horseName,
    )}</a>`;
    const clientIp = requestIp.getClientIp(await data?.originalData);

    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.UPDATE,
    );

    if (data.originalData.body.profileImageuuid) {
      let createUpdateTestimonialStallion = {
        activityTypeId: activityType?.id,
        farmId: data.originalData.body.farmId,
        stallionId: data.originalData.params.stallionId,
        additionalInfo: stallionProfile,
        attributeName: await data.subscribedData?.key,
        newValue: await data.subscribedData?.newValue,
        oldValue: await data.subscribedData?.oldValue,
        ipAddress: clientIp,
        userAgent: data.originalData.headers['user-agent'],
        userName: user.fullName,
        userEmail: user.email,
        userCountryId: user.countryId,
        createdBy: user.id,
        createdOn: new Date(),
        result: 'Success',
        activityModule: 'Stallions',
        reportType: null,
        entityId: null,
      };
      await this.activityRepository.save(createUpdateTestimonialStallion);
    } else {
      if (data.subscribedData?.key === 'farmId') {
        return;
      } else {
        let routeLink = `${
          this.baseUrl
        }/horsedetails/data/${await this.commonUtilsService.toTitleCase(
          horseName,
        )}/horsefilter`;

        let updatedStallionProfile = `<a href="${userRouteLink}" class="systemTooltip">${
          (await user).fullName
        }</a> updated <a href="${routeLink}" class="systemTooltip">${await this.commonUtilsService.toTitleCase(
          horseName,
        )}</a> ${await data?.subscribedData?.key} from  ${await data?.subscribedData?.oldValue} to ${await data?.subscribedData?.newValue}`;
        const activityType = await this.getActivityTypeByActivityTypeCode(
          activityTypes.UPDATE,
        );

        let createUpdateTestimonialStallion = {
          activityTypeId: activityType?.id,
          farmId: data.originalData.body.farmId,
          stallionId: data.originalData.params.stallionId,
          additionalInfo: updatedStallionProfile,
          attributeName: await data?.subscribedData?.key,
          newValue: await data?.subscribedData?.newValue,
          oldValue: await data?.subscribedData?.oldValue,
          ipAddress: clientIp,
          userAgent: data.originalData.headers['user-agent'],
          userName: user.fullName,
          userEmail: user.email,
          userCountryId: user.countryId,
          createdBy: user.id,
          createdOn: new Date(),
          result: 'Success',
          activityModule: 'Stallions',
          reportType: null,
          entityId: null,
        };
        await this.activityRepository.save(createUpdateTestimonialStallion);
      }
    }
  }

  @OnEvent('deleteFarmActivity')
  async deleteFarm(data) {
    let user = await this.membersService.findOneForActivityBymemberId(
      data.originalData.user.id,
    );
    let farm = this.farmService.getFarmByUuid(data.originalData.body.farmId);
    let routeLink = `${
      this.baseUrl
    }/farms/data/${await this.commonUtilsService.toTitleCase(
      (
        await farm
      ).farmName,
    )}/filter`;
    let userRouteLink = `${this.baseUrl}/members/data/${
      (await user).fullName
    }/userFilter`;

    let deleteFarm = `<a href="${userRouteLink}" class="systemTooltip">${
      (await user).fullName
    }</a> removed <a href="${routeLink}" class="systemTooltip">${
      (await farm).farmName
    }</a>`;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.DELETE,
    );

    let deleteFarmActivity = {
      activityTypeId: activityType?.id,
      farmId: data.originalData.body.farmId,
      stallionId: data?.originalData?.params?.stallionId,
      additionalInfo: deleteFarm,
      attributeName: await data?.subscribedData?.key,
      newValue: await data?.subscribedData?.newValue,
      oldValue: await data?.subscribedData?.oldValue,
      ipAddress: clientIp,
      userAgent: data.originalData.headers['user-agent'],
      userName: user.fullName,
      userEmail: user.email,
      userCountryId: user.countryId,
      createdBy: user.id,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'Farms',
      reportType: null,
      entityId: null,
    };
    await this.activityRepository.save(deleteFarmActivity);
  }

  @OnEvent('updateOverView')
  async updateOverViewAct(data) {
    let user = await this.membersService.findOneForActivityBymemberId(
      data.originalData.user.id,
    );
    let stallion = this.stallionsService.getStallionByUuid(
      data.originalData.params.stallionId,
    );
    let horse = this.horseService.findHorseById((await stallion).horseId);
    let horseName = (await horse).horseName;

    let routeLink = `${
      this.baseUrl
    }/horsedetails/data/${await this.commonUtilsService.toTitleCase(
      horseName,
    )}/horsefilter`;
    let userRouteLink = `${this.baseUrl}/members/data/${
      (await user).fullName
    }/userFilter`;

    let updateOverview = `<a href="${userRouteLink}" class="systemTooltip">${
      (await user).fullName
    }</a> updated <a href="${routeLink}" class="systemTooltip">${await this.commonUtilsService.toTitleCase(
      horseName,
    )}</a> overview description`;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.UPDATE,
    );

    let updateOverViewActivity = {
      activityTypeId: activityType?.id,
      farmId: data.originalData.body.farmId,
      stallionId: data?.originalData?.params?.stallionId,
      additionalInfo: updateOverview,
      attributeName: await data?.subscribedData?.key,
      newValue: await data?.subscribedData?.newValue,
      oldValue: await data?.subscribedData?.oldValue,
      ipAddress: clientIp,
      userAgent: data.originalData.headers['user-agent'],
      userName: user.fullName,
      userEmail: user.email,
      userCountryId: user.countryId,
      createdBy: user.id,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'Stallions',
      reportType: null,
      entityId: (await horse).horseUuid,
    };
    await this.activityRepository.save(updateOverViewActivity);
  }

  @OnEvent('addUpdateTestimonials')
  async addUpdateStallionTestimonial(data) {
    let user = await this.membersService.findOneForActivityBymemberId(
      data.originalData.user.id,
    );
    let stallion = this.stallionsService.getStallionByUuid(
      data.originalData.params.stallionId,
    );
    let horse = this.horseService.findHorseById((await stallion).horseId);
    let obj = data.originalData.body.testimonials;

    let routeLink = `${
      this.baseUrl
    }/horsedetails/data/${await this.commonUtilsService.toTitleCase(
      (
        await horse
      ).horseName,
    )}/horsefilter`;
    let userRouteLink = `${this.baseUrl}/members/data/${
      (await user).fullName
    }/userFilter`;

    let removeTestimonials = `<a href="${userRouteLink}" class="systemTooltip">${
      (await user).fullName
    }</a> removed <a href="${routeLink}" class="systemTooltip">${await this.commonUtilsService.toTitleCase(
      (
        await horse
      ).horseName,
    )}</a>`;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.DELETE,
    );

    for (const t in obj) {
      if (obj[t].isDeleted) {
        this.testimonialDeleted = true;
      } else {
        this.testimonialDeleted = false;
      }
    }

    if (this.testimonialDeleted == true) {
      let deleteOverViewActivity = {
        activityTypeId: activityType?.id,
        farmId: data.originalData.body.farmId,
        stallionId: data?.originalData?.params?.stallionId,
        additionalInfo: removeTestimonials,
        attributeName: await data?.subscribedData?.key,
        newValue: await data?.subscribedData?.newValue,
        oldValue: await data?.subscribedData?.oldValue,
        ipAddress: clientIp,
        userAgent: data.originalData.headers['user-agent'],
        userName: user.fullName,
        userEmail: user.email,
        userCountryId: user.countryId,
        createdBy: user.id,
        createdOn: new Date(),
        result: 'Success',
        activityModule: 'Stallions',
        reportType: null,
        entityId: (await horse).horseUuid,
      };
      await this.activityRepository.save(deleteOverViewActivity);
    } else {
      let routeLink = `${
        this.baseUrl
      }/horsedetails/data/${await this.commonUtilsService.toTitleCase(
        (
          await horse
        ).horseName,
      )}/horsefilter`;

      let updateTestimonials = `<a href="${userRouteLink}" class="systemTooltip">${
        (await user).fullName
      }</a> added a testimonial for  <a href="${routeLink}" class="systemTooltip">${await this.commonUtilsService.toTitleCase(
        (
          await horse
        ).horseName,
      )}</a>`;
      const activityType = await this.getActivityTypeByActivityTypeCode(
        activityTypes.UPDATE,
      );
      let updateOverViewActivity = {
        activityTypeId: activityType?.id,
        farmId: data.originalData.body.farmId,
        stallionId: data?.originalData?.params?.stallionId,
        additionalInfo: updateTestimonials,
        attributeName: await data?.subscribedData?.key,
        newValue: await data?.subscribedData?.newValue,
        oldValue: await data?.subscribedData?.oldValue,
        ipAddress: clientIp,
        userAgent: data.originalData.headers['user-agent'],
        userName: user.fullName,
        userEmail: user.email,
        userCountryId: user.countryId,
        createdBy: user.id,
        createdOn: new Date(),
        result: 'Success',
        activityModule: 'Stallions',
        reportType: null,
        entityId: (await horse).horseUuid,
      };
      await this.activityRepository.save(updateOverViewActivity);
    }
  }

  @OnEvent('updateProfile')
  async updateFarm(data) {
    let user = await this.membersService.findOneForActivityBymemberId(
      data.originalData.user.id,
    );
    let routeLink = `${
      this.baseUrl
    }/farms/data/${await this.commonUtilsService.toTitleCase(
      data.originalData.body.farmName,
    )}/filter`;
    let userRouteLink = `${this.baseUrl}/members/data/${
      (await user).fullName
    }/userFilter`;

    if ((await data.subscribedData) == undefined) return;

    let updateProfile = `<a href="${userRouteLink}" class="systemTooltip">${
      (await user).fullName
    }</a> updated <a href="${routeLink}" class="systemTooltip">${await this.commonUtilsService.toTitleCase(
      await data.originalData.body.farmName,
    )}</a> ${await data.subscribedData?.key} from ${await data.subscribedData
      ?.oldValue} to ${await data.subscribedData?.newValue}`;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.UPDATE,
    );

    let updateProfileActivity = {
      activityTypeId: activityType?.id,
      farmId: data.originalData.params.farmId,
      stallionId: data?.originalData?.params?.stallionId,
      additionalInfo: updateProfile,
      attributeName: await data?.subscribedData?.key,
      newValue: await data.subscribedData?.newValue,
      oldValue: await data.subscribedData?.oldValue,
      ipAddress: clientIp,
      userAgent: data.originalData.headers['user-agent'],
      userName: user.fullName,
      userEmail: user.email,
      userCountryId: user.countryId,
      createdBy: user.id,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'Farms',
      reportType: null,
      entityId: null,
    };
    await this.activityRepository.save(updateProfileActivity);
  }

  @OnEvent('uploadProfileImage')
  async updateProfileImageActivity(data) {
    let user = await this.membersService.findOneForActivityBymemberId(
      data.originalData.user.id,
    );
    let farm = this.farmService.getFarmByUuid(data.originalData.params.farmId);
    let routeLink = `${
      this.baseUrl
    }/farms/data/${await this.commonUtilsService.toTitleCase(
      (
        await farm
      ).farmName,
    )}/filter`;
    let userRouteLink = `${this.baseUrl}/members/data/${
      (await user).fullName
    }/userFilter`;

    let updateProfileImage = `<a href="${userRouteLink}" class="systemTooltip">${
      (await user).fullName
    }</a> added a new logo for <a href="${routeLink}" class="systemTooltip">${await this.commonUtilsService.toTitleCase(
      (
        await farm
      ).farmName,
    )}</a>`;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.UPDATE,
    );

    let uploadFarmImage = {
      activityTypeId: activityType?.id,
      farmId: data.originalData.params.farmId,
      stallionId: data?.originalData?.params?.stallionId,
      additionalInfo: updateProfileImage,
      attributeName: await data?.subscribedData?.key,
      newValue: await data?.subscribedData?.newValue,
      oldValue: await data?.subscribedData?.oldValue,
      ipAddress: clientIp,
      userAgent: data.originalData.headers['user-agent'],
      userName: user.fullName,
      userEmail: user.email,
      userCountryId: user.countryId,
      createdBy: user.id,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'Farms',
      reportType: null,
      entityId: null,
    };
    await this.activityRepository.save(uploadFarmImage);
  }

  @OnEvent('uploadFarmImageGallery')
  async uploadFarmImageGalleryActivity(data) {
    let user = await this.membersService.findOneForActivityBymemberId(
      data.originalData.user.id,
    );
    let farm = this.farmService.getFarmByUuid(data.originalData.params.farmId);
    let routeLink = `${
      this.baseUrl
    }/farms/data/${await this.commonUtilsService.toTitleCase(
      (
        await farm
      ).farmName,
    )}/filter`;
    let userRouteLink = `${this.baseUrl}/members/data/${
      (await user).fullName
    }/userFilter`;

    let uploadFarmImgGallery = `<a href="${userRouteLink}" class="systemTooltip">${
      (await user).fullName
    }</a> added images to <a href="${routeLink}" class="systemTooltip">${await this.commonUtilsService.toTitleCase(
      (
        await farm
      ).farmName,
    )}</a>'s gallery`;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.UPDATE,
    );

    let uploadFarmGallery = {
      activityTypeId: activityType?.id,
      farmId: data.originalData.params.farmId,
      stallionId: data?.originalData?.params?.stallionId,
      additionalInfo: uploadFarmImgGallery,
      attributeName: await data?.subscribedData?.key,
      newValue: await data?.subscribedData?.newValue,
      oldValue: await data?.subscribedData?.oldValue,
      ipAddress: clientIp,
      userAgent: data.originalData.headers['user-agent'],
      userName: user.fullName,
      userEmail: user.email,
      userCountryId: user.countryId,
      createdBy: user.id,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'Farms',
      reportType: null,
      entityId: null,
    };
    await this.activityRepository.save(uploadFarmGallery);
  }

  @OnEvent('uploadFarmOverview')
  async updateOverviewActivity(data) {
    let user = await this.membersService.findOneForActivityBymemberId(
      data.originalData.user.id,
    );
    let farm = this.farmService.getFarmByUuid(data.originalData.params.farmId);
    let routeLink = `${
      this.baseUrl
    }/farms/data/${await this.commonUtilsService.toTitleCase(
      (
        await farm
      ).farmName,
    )}/filter`;
    let userRouteLink = `${this.baseUrl}/members/data/${
      (await user).fullName
    }/userFilter`;
    let uploadFarmOverViews = `<a href="${userRouteLink}" class="systemTooltip">${
      (await user).fullName
    }</a> updated <a href="${routeLink}" class="systemTooltip">${
      (await farm).farmName
    }</a> overview`;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.UPDATE,
    );

    let uploadFarmoverviewActivity = {
      activityTypeId: activityType?.id,
      farmId: data.originalData.params.farmId,
      stallionId: data?.originalData?.params?.stallionId,
      additionalInfo: uploadFarmOverViews,
      attributeName: await data?.subscribedData?.key,
      newValue: await data?.subscribedData?.newValue,
      oldValue: await data?.subscribedData?.oldValue,
      ipAddress: clientIp,
      userAgent: data.originalData.headers['user-agent'],
      userName: user.fullName,
      userEmail: user.email,
      userCountryId: user.countryId,
      createdBy: user.id,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'Farms',
      reportType: null,
      entityId: null,
    };
    await this.activityRepository.save(uploadFarmoverviewActivity);
  }

  @OnEvent('updatemedias')
  async updatemediaActivity(data) {
    let user = await this.membersService.findOneForActivityBymemberId(
      data.originalData.user.id,
    );
    let farm = this.farmService.getFarmByUuid(data.originalData.params.farmId);

    let routeLink = `${
      this.baseUrl
    }/farms/data/${await this.commonUtilsService.toTitleCase(
      (
        await farm
      ).farmName,
    )}/filter`;
    let userRouteLink = `${this.baseUrl}/members/data/${
      (await user).fullName
    }/userFilter`;

    let removeMedia = `<a href="${userRouteLink}" class="systemTooltip">${
      (await user).fullName
    }</a> removed media from <a href="${routeLink}" class="systemTooltip">${
      (await farm).farmName
    }}</a>`;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.UPDATE,
    );

    if (data.originalData.body.isDeleted == true) {
      let removeMediaActivity = {
        activityTypeId: activityType?.id,
        farmId: data.originalData.params.farmId,
        stallionId: data?.originalData?.params?.stallionId,
        additionalInfo: removeMedia,
        attributeName: await data?.subscribedData?.key,
        newValue: await data?.subscribedData?.newValue,
        oldValue: await data?.subscribedData?.oldValue,
        ipAddress: clientIp,
        userAgent: data.originalData.headers['user-agent'],
        userName: user.fullName,
        userEmail: user.email,
        userCountryId: user.countryId,
        createdBy: user.id,
        createdOn: new Date(),
        result: 'Success',
        activityModule: 'Farms',
        reportType: null,
        entityId: null,
      };
      await this.activityRepository.save(removeMediaActivity);
    } else {
      let routeLink = `${
        this.baseUrl
      }/farms/data/${await this.commonUtilsService.toTitleCase(
        (
          await farm
        ).farmName,
      )}/filter`;
      let userRouteLink = `${this.baseUrl}/members/data/${
        (await user).fullName
      }/userFilter`;

      let updateMedia = `<a href="${userRouteLink}" class="systemTooltip">${
        (await user).fullName
      }</a> added Media to <a href="${routeLink}" class="systemTooltip">${
        (await farm).farmName
      }</a>`;
      const clientIp = requestIp.getClientIp(await data?.originalData);
      const activityType = await this.getActivityTypeByActivityTypeCode(
        activityTypes.UPDATE,
      );

      let uploadFarmoverviewActivity = {
        activityTypeId: activityType?.id,
        farmId: data.originalData.params.farmId,
        stallionId: data?.originalData?.params?.stallionId,
        additionalInfo: updateMedia,
        attributeName: await data?.subscribedData?.key,
        newValue: await data?.subscribedData?.newValue,
        oldValue: await data?.subscribedData?.oldValue,
        ipAddress: clientIp,
        userAgent: data.originalData.headers['user-agent'],
        userName: user.fullName,
        userEmail: user.email,
        userCountryId: user.countryId,
        createdBy: user.id,
        createdOn: new Date(),
        result: 'Success',
        activityModule: 'Farms',
        reportType: null,
        entityId: null,
      };
      await this.activityRepository.save(uploadFarmoverviewActivity);
    }
  }

  @OnEvent('memberInvitationFarm')
  async memberFarmInvitation(data) {
    let user = await this.membersService.findOneForActivityBymemberId(
      data.originalData.user.id,
    );
    let farm = this.farmService.getFarmByUuid(data.originalData.body.farmId);

    let routeLink = `${
      this.baseUrl
    }/farms/data/${await this.commonUtilsService.toTitleCase(
      (
        await farm
      ).farmName,
    )}/filter`;
    let userRouteLink = `${this.baseUrl}/members/data/${
      (await user).fullName
    }/userFilter`;

    let memberInvitationFarm = `<a href="${userRouteLink}" class="systemTooltip">${
      (await user).fullName
    }</a> invited ${await data.originalData.body
      .fullName} to <a href="${routeLink}" class="systemTooltip">${await this.commonUtilsService.toTitleCase(
      (
        await farm
      ).farmName,
    )}</a>`;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.UPDATE,
    );

    let memberInvitationFarmActivity = {
      activityTypeId: activityType?.id,
      farmId: data.originalData.body.farmId,
      stallionId: data?.originalData?.params?.stallionId,
      additionalInfo: memberInvitationFarm,
      attributeName: await data?.subscribedData?.key,
      newValue: await data?.subscribedData?.newValue,
      oldValue: await data?.subscribedData?.oldValue,
      ipAddress: clientIp,
      userAgent: data.originalData.headers['user-agent'],
      userName: user.fullName,
      userEmail: user.email,
      userCountryId: user.countryId,
      createdBy: user.id,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'Members',
      reportType: null,
      entityId: null,
    };
    await this.activityRepository.save(memberInvitationFarmActivity);
  }

  @OnEvent('downloadMareList')
  async downloadMareListActivitiy(data) {
    let user = await this.membersService.findOneForActivityBymemberId(
      data.originalData.user.id,
    );
    let farm = this.farmService?.getFarmByUuid(data.originalData.query.farmId);
    let mare = this.mareListInfoService?.findMareList(
      await data.originalData.params.id,
    );
    let member = await this.memberAddressService.findMemberInfo(await user);
    let memberAddress = await this.countryService.findByCountryId(
      member.countryId,
    );

    let routeLink = `${
      this.baseUrl
    }/farms/data/${await this.commonUtilsService.toTitleCase(
      (
        await farm
      ).farmName,
    )}/filter`;
    let userRouteLink = `${this.baseUrl}/members/data/${
      (await user).fullName
    }/userFilter`;

    let downloadMareList = `<a href="${userRouteLink}" class="systemTooltip">${
      (await user).fullName
    }</a> from <a href="${routeLink}" class="systemTooltip"> ${await this.commonUtilsService.toTitleCase(
      (
        await farm
      ).farmName,
    )}</a> downloaded the Mare List ${
      (await mare).listname
    } from ${await memberAddress.countryName}`;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.READ,
    );

    let downloadMareListActivity = {
      activityTypeId: activityType?.id,
      farmId: data.originalData.query.farmId,
      stallionId: data?.originalData?.params?.stallionId,
      additionalInfo: downloadMareList,
      attributeName: await data?.subscribedData?.key,
      newValue: await data?.subscribedData?.newValue,
      oldValue: await data?.subscribedData?.oldValue,
      ipAddress: clientIp,
      userAgent: data.originalData.headers['user-agent'],
      userName: user.fullName,
      userEmail: user.email,
      userCountryId: user.countryId,
      createdBy: user.id,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'Mares',
      reportType: null,
      entityId: null,
    };
    await this.activityRepository.save(downloadMareListActivity);
  }

  @OnEvent('addingMareList')
  async addingMareListActivity(data) {
    let user = await this.membersService.findOneForActivityBymemberId(
      data.originalData.user.id,
    );
    let farm = this.farmService?.getFarmByUuid(data.originalData.params.farmId);
    let member = await this.memberAddressService.findMemberInfo(await user);
    let memberAddress = await this.countryService.findByCountryId(
      member.countryId,
    );
    let memberInfo = await this.membersService.findName(await member.memberId);

    let routeLink = `${
      this.baseUrl
    }/farms/data/${await this.commonUtilsService.toTitleCase(
      (
        await farm
      ).farmName,
    )}/filter`;
    let userRouteLink = `${this.baseUrl}/members/data/${
      (await user).fullName
    }/userFilter`;

    let addMareList = `<a href="${userRouteLink}" class="systemTooltip">${
      (await user).fullName
    }</a> from <a href="${routeLink}" class="systemTooltip">${await this.commonUtilsService.toTitleCase(
      (
        await farm
      ).farmName,
    )}</a> uploaded a new Mare List named ${await data.originalData.body[
      'name'
    ]} from ${await memberAddress.countryName}`;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.READ,
    );

    let memberInvitationFarmActivity = {
      activityTypeId: activityType?.id,
      farmId: data.originalData.params.farmId,
      stallionId: data?.originalData?.params?.stallionId,
      additionalInfo: addMareList,
      attributeName: 'mareListName',
      newValue: await data.originalData.body['name'],
      oldValue: await data?.subscribedData?.oldValue,
      ipAddress: clientIp,
      userAgent: data.originalData.headers['user-agent'],
      userName: user.fullName,
      userEmail: user.email,
      userCountryId: user.countryId,
      createdBy: user.id,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'MaresList',
      reportType: null,
      entityId: await memberInfo.memberuuid,
    };
    await this.activityRepository.save(memberInvitationFarmActivity);
  }

  @OnEvent('deleteMareListName')
  async deleteMareListNameActivity(data) {
    let user = await this.membersService.findOneForActivityBymemberId(
      data.originalData.user.id,
    );
    let farm = this.farmService?.getFarmByUuid(data.originalData.body.farmId);
    let memberAddress = await this.countryService.findByCountryId(
      user.countryId,
    );
    let memberInfo = await this.membersService.findName(user.id);

    let routeLink = `${
      this.baseUrl
    }/farms/data/${await this.commonUtilsService.toTitleCase(
      (
        await farm
      ).farmName,
    )}/filter`;
    let userRouteLink = `${this.baseUrl}/members/data/${user.fullName}/userFilter`;

    let deleteMareList = `<a href="${userRouteLink}" class="systemTooltip">${
      user.fullName
    }</a> from <a href="${routeLink}" class="systemTooltip">${await this.commonUtilsService.toTitleCase(
      (
        await farm
      ).farmName,
    )}</a> removed  mare list from ${await memberAddress.countryName}`;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.DELETE,
    );

    let memberInvitationFarmActivity = {
      activityTypeId: activityType?.id,
      farmId: data.originalData.body.farmId,
      stallionId: data?.originalData?.params?.stallionId,
      additionalInfo: deleteMareList,
      attributeName: await data?.subscribedData?.key,
      newValue: await data?.subscribedData?.newValue,
      oldValue: await data?.subscribedData?.oldValue,
      ipAddress: clientIp,
      userAgent: data.originalData.headers['user-agent'],
      userName: user.fullName,
      userEmail: user.email,
      userCountryId: user.countryId,
      createdBy: user.id,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'MaresList',
      reportType: null,
      entityId: await memberInfo?.memberuuid,
    };
    await this.activityRepository.save(memberInvitationFarmActivity);
  }

  @OnEvent('deleteConversation')
  async deleteConversation(data) {
    let user = await this.membersService.findOneForActivityBymemberId(
      data.originalData.user.id,
    );
    let userRouteLink = `${this.baseUrl}/members/data/${
      (await user).fullName
    }/userFilter`;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.DELETE,
    );

    let activityData = {
      activityTypeId: activityType?.id,
      farmId: data.originalData.params.farmId,
      stallionId: data?.originalData?.params?.stallionId,
      additionalInfo: `<a href="${userRouteLink}" class="systemTooltip">${user.fullName}</a> deleted a conversation`,
      attributeName: await data?.subscribedData?.key,
      newValue: await data?.subscribedData?.newValue,
      oldValue: await data?.subscribedData?.oldValue,
      ipAddress: clientIp,
      userAgent: data.originalData.headers['user-agent'],
      userName: user.fullName,
      userEmail: user.email,
      userCountryId: user.countryId,
      createdBy: user.id,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'Messages',
      reportType: null,
      entityId: null,
    };
    await this.activityRepository.save(activityData);
  }

  @OnEvent('acceptOrRejectNominationRequest')
  async acceptOrRejectNominationRequest(data) {
    let user = await this.membersService.findOneForActivityBymemberId(
      data.originalData.user.id,
    );
    const nominationRequest = await this.nominationRequestService.findOne(
      data.originalData?.body?.requestId,
    );
    let additionalInfo = '';

    let routeLink = `${
      this.baseUrl
    }/farms/data/${await this.commonUtilsService.toTitleCase(
      await nominationRequest.farmName,
    )}/filter`;
    let userRouteLink = `${this.baseUrl}/members/data/${user.fullName}/userFilter`;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.UPDATE,
    );

    if (data.originalData?.body?.isAccepted) {
      additionalInfo = `<a href="${userRouteLink}" class="systemTooltip">${await this.commonUtilsService.toTitleCase(
        user.fullName,
      )}</a> from <a href="${routeLink}" class="systemTooltip">${await this.commonUtilsService.toTitleCase(
        nominationRequest.farmName,
      )}</a> accepted a Nomination Request for <a href="#" class="systemTooltip">${await this.commonUtilsService.toTitleCase(
        nominationRequest.horseName,
      )}</a>`;
    } else if (data.originalData?.body?.isDeclined) {
      additionalInfo = `<a href="${userRouteLink}" class="systemTooltip">${await this.commonUtilsService.toTitleCase(
        user.fullName,
      )}</a> from <a href="${routeLink}" class="systemTooltip">${await this.commonUtilsService.toTitleCase(
        nominationRequest.farmName,
      )}</a> rejected a Nomination Request for <a href="#" class="systemTooltip">${await this.commonUtilsService.toTitleCase(
        nominationRequest.horseName,
      )}</a>`;
    } else if (data.originalData?.body?.isCounterOffer) {
      additionalInfo = `<a href="${userRouteLink}" class="systemTooltip">${await this.commonUtilsService.toTitleCase(
        user.fullName,
      )}</a> from <a href="${routeLink}" class="systemTooltip">${await this.commonUtilsService.toTitleCase(
        nominationRequest.farmName,
      )}</a> counter offered a Nomination Request for <a href="#" class="systemTooltip">${await this.commonUtilsService.toTitleCase(
        nominationRequest.horseName,
      )}</a>`;
    }
    let activityData = {
      activityTypeId: activityType?.id,
      farmId: nominationRequest.farmUuid,
      stallionId: nominationRequest.stallionUuid,
      additionalInfo: additionalInfo,
      attributeName: await data?.subscribedData?.key,
      newValue: await data?.subscribedData?.newValue,
      oldValue: await data?.subscribedData?.oldValue,
      ipAddress: clientIp,
      userAgent: data.originalData.headers['user-agent'],
      userName: user.fullName,
      userEmail: user.email,
      userCountryId: user.countryId,
      createdBy: user.id,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'Nominations',
      reportType: null,
      entityId: null,
    };
    await this.activityRepository.save(activityData);
  }

  @OnEvent('updateMareList')
  async updateMareListActivity(data) {
    let user = await this.membersService.findOneForActivityBymemberId(
      data.originalData.user.id,
    );
    let farm = this.farmService?.getFarmByUuid(data.originalData.body.farmId);

    let routeLink = `${
      this.baseUrl
    }/farms/data/${await this.commonUtilsService.toTitleCase(
      (
        await farm
      ).farmName,
    )}/filter`;
    let userRouteLink = `${this.baseUrl}/members/data/${
      (await user).fullName
    }/userFilter`;

    let updateMareList = `<a href="${userRouteLink}" class="systemTooltip">${
      (await user).fullName
    }</a> from <a href="${routeLink}" class="systemTooltip">${await this.commonUtilsService.toTitleCase(
      (
        await farm
      ).farmName,
    )}</a> edited to ${await data.originalData.body.listname}`;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.UPDATE,
    );

    let updateMareListsActivity = {
      activityTypeId: activityType?.id,
      farmId: data.originalData.body.farmId,
      stallionId: data?.originalData?.params?.stallionId,
      additionalInfo: updateMareList,
      attributeName: 'mareList',
      newValue: await data.originalData.body.listname,
      oldValue: await data?.subscribedData?.oldValue,
      ipAddress: clientIp,
      userAgent: data.originalData.headers['user-agent'],
      userName: user.fullName,
      userEmail: user.email,
      userCountryId: user.countryId,
      createdBy: user.id,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'MaresList',
      reportType: null,
      entityId: null,
    };
    await this.activityRepository.save(updateMareListsActivity);
  }

  @OnEvent('addingStallionToFarm')
  async addingStallionToFarm(data) {
    let user = await this.membersService.findOneForActivityBymemberId(
      data.originalData.user.id,
    );
    let farm = await this.farmService?.getFarmByUuid(
      data.originalData.body.farmId,
    );
    let horse = await this.horseService.findHorsesByUuid(
      await data.originalData.body.horseId,
    );
    let horseName = await this.commonUtilsService.toTitleCase(horse?.horseName);
    let member = await this.memberAddressService.findMemberInfo(await user);
    let memberAddress = await this.countryService.findByCountryId(
      user.countryId,
    );
    let memberInfo = await this.membersService.findName(user.id);
    let userRouteLink = `${this.baseUrl}/members/data/${user?.fullName}/userFilter`;

    let routeLink = `${this.baseUrl}/farms/data/${await this.commonUtilsService.toTitleCase(farm?.farmName)}/filter`;
    let horseRouteLink = `${this.baseUrl}/horsedetails/data/${horseName}/horsefilter`;

    let addingStallion = `<a href="${userRouteLink}" class="systemTooltip">${
      (await user).fullName
    }</a> has added a new stallion <a href="${horseRouteLink}" class="systemTooltip">${await this.commonUtilsService.toTitleCase(await horseName)}</a> to <a href="${routeLink}" class="systemTooltip">${await this.commonUtilsService.toTitleCase(
      (
        await farm
      ).farmName,
    )}</a> in ${await memberAddress.countryName}`;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.UPDATE,
    );

    let addingStallionToFarmActivity = {
      activityTypeId: activityType?.id,
      farmId: data.originalData.body.farmId,
      stallionId: data?.originalData?.params?.stallionId,
      additionalInfo: addingStallion,
      attributeName: await data?.subscribedData?.key,
      newValue: await data?.subscribedData?.newValue,
      oldValue: await data?.subscribedData?.oldValue,
      ipAddress: clientIp,
      userAgent: data.originalData.headers['user-agent'],
      userName: user.fullName,
      userEmail: user.email,
      userCountryId: user.countryId,
      createdBy: user.id,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'Stallions',
      reportType: null,
      entityId: await memberInfo?.memberuuid,
    };
    await this.activityRepository.save(addingStallionToFarmActivity);
  }

  @OnEvent('stallionPromotions')
  async addStallionPromotions(data) {
    let user = await this.membersService.findOneForActivityBymemberId(
      data.originalData.user.id,
    );
    let stallion = await this.stallionsService.getStallionByUuid(
      data.originalData.body.stallionId,
    );
    let farm = await this.farmService?.findFarmUuid(stallion.farmId);
    let horse = await this.horseService.findHorseById(stallion.horseId);
    let horseName = await this.commonUtilsService.toTitleCase(horse.horseName);

    let routeLink = `${
      this.baseUrl
    }/farms/data/${await this.commonUtilsService.toTitleCase(
      (
        await farm
      ).farmName,
    )}/filter`;
    let horseRouteLink = `${this.baseUrl}/horsedetails/data/${horseName}/horsefilter`;
    let userRouteLink = `${this.baseUrl}/members/data/${user.fullName}/userFilter`;

    let stallionPromotions = `<a href="${userRouteLink}" class="systemTooltip">${
      user.fullName
    }</a> from <a href="${routeLink}" class="systemTooltip">${await this.commonUtilsService.toTitleCase(
      (
        await farm
      ).farmName,
    )}</a> promoted <a href="${horseRouteLink}" class="systemTooltip">${horseName}</a> starting ${
      data.originalData.body.startDate
    }`;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.CREATE,
    );

    let stallionPromotionActivity = {
      activityTypeId: activityType?.id,
      farmId: (await farm).farmUuid,
      stallionId: (await stallion).stallionUuid,
      additionalInfo: stallionPromotions,
      attributeName: await data?.subscribedData?.key,
      newValue: await data?.subscribedData?.newValue,
      oldValue: await data?.subscribedData?.oldValue,
      ipAddress: clientIp,
      userAgent: data.originalData.headers['user-agent'],
      userName: user.fullName,
      userEmail: user.email,
      userCountryId: user.countryId,
      createdBy: user.id,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'Stallions',
      reportType: null,
      entityId: null,
    };
    await this.activityRepository.save(stallionPromotionActivity);
  }

  @OnEvent('replied')
  async replied(data) {
    const { channelId, stallionId, farmId, fromMemberUuid } =
      data.originalData.body;
    let user = await this.membersService.findName(data.originalData.user.id);
    let address = await this.memberAddressService.findMemberInfo(user);
    let farm = await this.farmService.getFarmByUuid(farmId);
    const replyTo = await this.membersService.findByFilelds({
      memberuuid: fromMemberUuid,
    });

    let routeLink = `${
      this.baseUrl
    }/farms/data/${await this.commonUtilsService.toTitleCase(
      (
        await farm
      ).farmName,
    )}/filter`;
    let userRouteLink = `${this.baseUrl}/members/data/${
      (await user).fullName
    }/userFilter`;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.UPDATE,
    );

    if (channelId && user.id != replyTo[0].id) {
      const msgChannelRes = await this.messageChannelService.findWhere({
        channelUuid: channelId,
      });
      if (msgChannelRes.length > 0) {
        const messages =
          await this.messageService.getMessageByChannelIdAndRecipient(
            msgChannelRes[0].id,
            replyTo[0].id,
            user.id,
          );
        let reply = [];
        messages.forEach(async (item) => {
          if (item.memberId == user.id) {
            reply.push(item);
          }
        });
        if (reply.length <= 1) {
          let additionalInfo = `<a href="${userRouteLink}" class="systemTooltip">${await this.commonUtilsService.toTitleCase(
            user.fullName,
          )}</a> from <a href="${routeLink}" class="systemTooltip">${await this.commonUtilsService.toTitleCase(
            farm.farmName,
          )}</a> replied to $<a href="${userRouteLink}" class="systemTooltip">${await this.commonUtilsService.toTitleCase(
            replyTo[0].fullName,
          )}</a>`;
          let activityData = {
            activityTypeId: activityType?.id,
            farmId: farmId,
            stallionId: stallionId,
            additionalInfo: additionalInfo,
            attributeName: await data?.subscribedData?.key,
            newValue: await data?.subscribedData?.newValue,
            oldValue: await data?.subscribedData?.oldValue,
            ipAddress: clientIp,
            userAgent: data.originalData.headers['user-agent'],
            userName: user.fullName,
            userEmail: user.email,
            userCountryId: address.countryId,
            createdBy: user.id,
            createdOn: new Date(),
            result: 'Success',
            activityModule: 'Messages',
            reportType: null,
            entityId: null,
          };
          await this.activityRepository.save(activityData);
        }
      }
    }
  }

  @OnEvent('updateUserProfileImage')
  async updateUserProfileImage(data) {
    let user = await this.membersService.findOneForActivityBymemberId(
      data.originalData.user.id,
    );
    let userRouteLink = `${this.baseUrl}/members/data/${user.fullName}/userFilter`;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.CREATE,
    );

    let activityData = {
      activityTypeId: activityType?.id,
      farmId: data?.originalData?.params?.farmId,
      stallionId: data?.originalData?.params?.stallionId,
      additionalInfo: `<a href="${userRouteLink}" class="systemTooltip">${await this.commonUtilsService.toTitleCase(
        user.fullName,
      )}</a> uploaded a profile image`,
      attributeName: await data?.subscribedData?.key,
      newValue: await data?.subscribedData?.newValue,
      oldValue: await data?.subscribedData?.oldValue,
      ipAddress: clientIp,
      userAgent: data.originalData.headers['user-agent'],
      userName: user.fullName,
      userEmail: user.email,
      userCountryId: user.countryId,
      createdBy: user.id,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'Members',
      reportType: null,
      entityId: null,
    };
    await this.activityRepository.save(activityData);
  }

  @OnEvent('passwordChange')
  async passwordChange(data) {
    let user = await this.membersService.findOneForActivityBymemberId(
      data.originalData.user.id,
    );
    let userRouteLink = `${this.baseUrl}/members/data/${user.fullName}/userFilter`;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.UPDATE,
    );

    let stallionPromotionActivity = {
      activityTypeId: activityType?.id,
      farmId: data?.originalData?.params?.farmId,
      stallionId: data?.originalData?.params?.stallionId,
      additionalInfo: `Password changed for <a href="${userRouteLink}" class="systemTooltip">${await this.commonUtilsService.toTitleCase(
        user.fullName,
      )}</a>`,
      attributeName: await data?.subscribedData?.key,
      newValue: await data?.subscribedData?.newValue,
      oldValue: await data?.subscribedData?.oldValue,
      ipAddress: clientIp,
      userAgent: data.originalData.headers['user-agent'],
      userName: user.fullName,
      userEmail: user.email,
      userCountryId: user.countryId,
      createdBy: user.id,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'Members',
      reportType: null,
      entityId: null,
    };
    await this.activityRepository.save(stallionPromotionActivity);
  }

  @OnEvent('stallionStopPromotion')
  async updateStallionStopPromotionActivity(data) {
    let user = await this.membersService.findOneForActivityBymemberId(
      data.originalData.user.id,
    );
    let stallion = this.stallionsService.getStallionByUuid(
      data.originalData.body.stallionId,
    );
    let farm = this.farmService?.findFarmUuid((await stallion).farmId);
    let horse = this.horseService.findHorseById((await stallion).horseId);
    let horseName = await this.commonUtilsService.toTitleCase(
      (await horse).horseName,
    );

    let routeLink = `${
      this.baseUrl
    }/farms/data/${await this.commonUtilsService.toTitleCase(
      (
        await farm
      ).farmName,
    )}/filter`;
    let horseRouteLink = `${
      this.baseUrl
    }/horsedetails/data/${await horseName}/horsefilter`;
    let userRouteLink = `${this.baseUrl}/members/data/${
      (await user).fullName
    }/userFilter`;

    let stallionStopPromotion = `<a href="${userRouteLink}" class="systemTooltip">${
      (await user).fullName
    }</a> from <a href="${routeLink}" class="systemTooltip">${await this.commonUtilsService.toTitleCase(
      (
        await farm
      ).farmName,
    )}</a> changed the promoted start date for <a href="${horseRouteLink}" class="systemTooltip">${await this.commonUtilsService.toTitleCase(
      await horseName,
    )}</a> from ${await data?.subscribedData?.oldValue} to ${await data
      ?.subscribedData?.newValue}`;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.UPDATE,
    );

    let updateStallionStopPromotionActivity = {
      activityTypeId: activityType?.id,
      farmId: (await farm).farmUuid,
      stallionId: data.originalData.body.stallionId,
      additionalInfo: stallionStopPromotion,
      attributeName: await data?.subscribedData?.key,
      newValue: await data?.subscribedData?.newValue,
      oldValue: await data?.subscribedData?.oldValue,
      ipAddress: clientIp,
      userAgent: data.originalData.headers['user-agent'],
      userName: user.fullName,
      userEmail: user.email,
      userCountryId: user.countryId,
      createdBy: user.id,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'Stallions',
      reportType: null,
      entityId: (await horse).horseUuid,
    };
    await this.activityRepository.save(updateStallionStopPromotionActivity);
  }

  @OnEvent('stallionNominations')
  async createStallionNominations(data) {
    let user = await this.membersService.findOneForActivityBymemberId(
      data.originalData.user.id,
    );
    let stallion = await this.stallionsService.getStallionWithFarm(
      data.originalData.body.stallionId,
    );

    let routeLink = `${
      this.baseUrl
    }/farms/data/${await this.commonUtilsService.toTitleCase(
      await stallion?.farmName,
    )}/filter`;
    let horseRouteLink = `${
      this.baseUrl
    }/horsedetails/data/${await this.commonUtilsService.toTitleCase(
      stallion?.horseName,
    )}/horsefilter`;
    let userRouteLink = `${this.baseUrl}/members/data/${
      (await user).fullName
    }/userFilter`;

    let stallionNomination = `<a href="${userRouteLink}" class="systemTooltip">${
      (await user).fullName
    }</a> from <a href="${routeLink}" class="systemTooltip">${await this.commonUtilsService.toTitleCase(
      await stallion?.farmName,
    )}</a> activated Nominations for <a href="${horseRouteLink}" class="systemTooltip">${await this.commonUtilsService.toTitleCase(
      stallion?.horseName,
    )}</a>`;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.CREATE,
    );

    let activityData = {
      activityTypeId: activityType?.id,
      farmId: stallion.farmId,
      stallionId: data.originalData.body.stallionId,
      additionalInfo: stallionNomination,
      attributeName: await data?.subscribedData?.key,
      newValue: await data?.subscribedData?.newValue,
      oldValue: await data?.subscribedData?.oldValue,
      ipAddress: clientIp,
      userAgent: data.originalData.headers['user-agent'],
      userName: user.fullName,
      userEmail: user.email,
      userCountryId: user.countryId,
      createdBy: user.id,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'Stallions',
      reportType: null,
      entityId: null,
    };
    await this.activityRepository.save(activityData);
  }

  @OnEvent('deleteStallion')
  async deleteStallion(data) {
    let user = await this.membersService.findName(data.originalData.user.id);
    let address = await this.memberAddressService.findMemberInfo(user);
    if (user?.isVerified) {
      const { stallionId } = data.originalData.body;
      let stallion = await this.stallionsService.getStallionWithFarm(
        stallionId,
      );

      let routeLink = `${
        this.baseUrl
      }/farms/data/${await this.commonUtilsService.toTitleCase(
        await stallion?.farmName,
      )}/filter`;
      let horseRouteLink = `${
        this.baseUrl
      }/horsedetails/data/${await this.commonUtilsService.toTitleCase(
        stallion?.horseName,
      )}/horsefilter`;
      let userRouteLink = `${this.baseUrl}/members/data/${
        (await user).fullName
      }/userFilter`;

      let deleteStallion = `<a href="${userRouteLink}" class="systemTooltip">${
        (await user).fullName
      }</a> verified removing stallion <a href="${horseRouteLink}" class="systemTooltip">${await this.commonUtilsService.toTitleCase(
        await stallion?.horseName,
      )}</a> from <a href="${routeLink}" class="systemTooltip">${await this.commonUtilsService.toTitleCase(
        stallion?.farmName,
      )}</a>`;
      const clientIp = requestIp.getClientIp(await data?.originalData);
      const activityType = await this.getActivityTypeByActivityTypeCode(
        activityTypes.DELETE,
      );

      let activityData = {
        activityTypeId: activityType?.id,
        farmId: stallion.farmId,
        stallionId: stallionId,
        additionalInfo: deleteStallion,
        attributeName: await data?.subscribedData?.key,
        newValue: await data?.subscribedData?.newValue,
        oldValue: await data?.subscribedData?.oldValue,
        ipAddress: clientIp,
        userAgent: data.originalData.headers['user-agent'],
        userName: user.fullName,
        userEmail: user.email,
        userCountryId: address.countryId,
        createdBy: user.id,
        createdOn: new Date(),
        result: 'Success',
        activityModule: 'Stallions',
        reportType: null,
        entityId: null,
      };
      await this.activityRepository.save(activityData);
    }
  }

  @OnEvent('removeStallionWithReason')
  async removeStallionWithReason(data) {
    let user = await this.membersService.findName(data.originalData.user.id);
    const { stallionId, reasonId } = data.originalData.params;
    let stallion = await this.stallionsService.getStallionWithFarm(stallionId);
    let stallionReason = await this.stallionReasonsService.findOneReason({
      id: reasonId,
    });
    let member = await this.memberAddressService.findMemberInfo(await user);
    let memberAddress = await this.countryService.findByCountryId(
      member.countryId,
    );
    let memberInfo = await this.membersService.findName(await member.memberId);

    let routeLink = `${
      this.baseUrl
    }/farms/data/${await this.commonUtilsService.toTitleCase(
      await stallion?.farmName,
    )}/filter`;
    let horseRouteLink = `${
      this.baseUrl
    }/horsedetails/data/${await this.commonUtilsService.toTitleCase(
      stallion?.horseName,
    )}/horsefilter`;
    let userRouteLink = `${this.baseUrl}/members/data/${
      (await user).fullName
    }/userFilter`;

    let removeStallionWithReason = `<a href="${userRouteLink}" class="systemTooltip">${
      (await user).fullName
    }</a> removed <a href="${horseRouteLink}" class="systemTooltip">${await this.commonUtilsService.toTitleCase(
      stallion?.horseName,
    )}</a> from <a href="${routeLink}" class="systemTooltip">${await this.commonUtilsService.toTitleCase(
      stallion?.farmName,
    )}</a> due to ${await this.commonUtilsService.toTitleCase(
      stallionReason?.reasonName,
    )} via ${await memberAddress.countryName}`;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.DELETE,
    );

    let activityData = {
      activityTypeId: activityType?.id,
      farmId: stallion.farmId,
      stallionId: stallionId,
      additionalInfo: removeStallionWithReason,
      attributeName: await data?.subscribedData?.key,
      newValue: await data?.subscribedData?.newValue,
      oldValue: await data?.subscribedData?.oldValue,
      ipAddress: clientIp,
      userAgent: data.originalData.headers['user-agent'],
      userName: user.fullName,
      userEmail: user.email,
      userCountryId: member.countryId,
      createdBy: user.id,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'Stallions',
      reportType: null,
      entityId: await memberInfo.memberuuid,
    };
    await this.activityRepository.save(activityData);
  }

  @OnEvent('updateStallionGalleryImages')
  async updateStallionGalleryImages(data) {
    let user = await this.membersService.findOneForActivityBymemberId(
      data.originalData.user.id,
    );
    const { stallionId } = data.originalData.params;
    const { body } = data.originalData;
    let stallion = await this.stallionsService.getStallionWithFarm(stallionId);

    let horseRouteLink = `${
      this.baseUrl
    }/horsedetails/data/${await this.commonUtilsService.toTitleCase(
      await stallion?.horseName,
    )}/horsefilter`;
    let userRouteLink = `${this.baseUrl}/members/data/${
      (await user).fullName
    }/userFilter`;

    let updateStallionGalleryImg = `<a href="${userRouteLink}" class="systemTooltip">${
      (await user).fullName
    }</a> added ${
      body?.galleryImages.length
    } images to  <a href="${horseRouteLink}"class="systemTooltip">${await this.commonUtilsService.toTitleCase(
      await stallion?.horseName,
    )}</a>'s gallery`;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.UPDATE,
    );

    let activityData = {
      activityTypeId: activityType?.id,
      farmId: stallion.farmId,
      stallionId: stallionId,
      additionalInfo: updateStallionGalleryImg,
      attributeName: await data?.subscribedData?.key,
      newValue: await data?.subscribedData?.newValue,
      oldValue: await data?.subscribedData?.oldValue,
      ipAddress: clientIp,
      userAgent: data.originalData.headers['user-agent'],
      userName: user.fullName,
      userEmail: user.email,
      userCountryId: user.countryId,
      createdBy: user.id,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'Stallions',
      reportType: null,
      entityId: null,
    };
    await this.activityRepository.save(activityData);
  }

  @OnEvent('updateMemberDetail')
  async updateMemberDetailActivity(data) {
    let user = await this.membersService.findOneForActivityBymemberId(
      data.originalData.user.id,
    );
    const { body } = data.originalData;
    let newValue = await data?.subscribedData?.newValue;
    let oldValue = await data?.subscribedData?.oldValue;
    let key = await data?.subscribedData?.key;

    let userRouteLink = `${this.baseUrl}/members/data/${
      (await user).fullName
    }/userFilter`;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.UPDATE,
    );

    let additionalInfo = '';
    if (key === 'fullName') {
      additionalInfo = `<a href="${userRouteLink}" class="systemTooltip">${await this.commonUtilsService.toTitleCase(
        body.fullName,
      )}</a> changed their name from ${await this.commonUtilsService.toTitleCase(
        oldValue,
      )} to ${await this.commonUtilsService.toTitleCase(newValue)}`;
    } else if (key === 'email') {
      additionalInfo = `${await this.commonUtilsService.toTitleCase(
        (await user).fullName,
      )} changed their email address from ${await oldValue} to ${await newValue}`;
    }
    let updateMemberDetailActivity = {
      activityTypeId: activityType?.id,
      additionalInfo: await additionalInfo,
      attributeName: key,
      newValue: newValue,
      oldValue: oldValue,
      ipAddress: clientIp,
      userAgent: data.originalData.headers['user-agent'],
      userName: user.fullName,
      userEmail: user.email,
      userCountryId: user.countryId,
      createdBy: user.id,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'Members',
      reportType: null,
      entityId: null,
    };
    await this.activityRepository.save(updateMemberDetailActivity);
  }

  @OnEvent('searchStallionDirectory')
  async searchStallionDirectoryActivity(data) {}

  @OnEvent('stallionShortlist')
  async stallionShortlist(data) {
    let user = await this.membersService.findOneForActivityBymemberId(
      data.originalData.user.id,
    );
    const { stallionId } = data.originalData.body;
    let stallion = await this.stallionsService.getStallionWithFarm(stallionId);

    let horseRouteLink = `${
      this.baseUrl
    }/horsedetails/data/${await this.commonUtilsService.toTitleCase(
      stallion?.horseName,
    )}/horsefilter`;
    let userRouteLink = `${this.baseUrl}/members/data/${
      (await user).fullName
    }/userFilter`;

    let stallionShortList = `<a href="${userRouteLink}" class="systemTooltip">${
      (await user).fullName
    }</a> added <a href="${horseRouteLink}" class="systemTooltip">${await this.commonUtilsService.toTitleCase(
      stallion.horseName,
    )}</a> to their shortlist`;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.CREATE,
    );

    let stallionShortlistActivity = {
      activityTypeId: activityType?.id,
      farmId: stallion.farmId,
      stallionId: stallion.stallionId,
      additionalInfo: stallionShortList,
      attributeName: await data?.subscribedData?.key,
      newValue: await data?.subscribedData?.newValue,
      oldValue: await data?.subscribedData?.oldValue,
      ipAddress: clientIp,
      userAgent: data.originalData.headers['user-agent'],
      userName: user.fullName,
      userEmail: user.email,
      userCountryId: user.countryId,
      createdBy: user.id,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'Stallions',
      reportType: null,
      entityId: null,
    };
    await this.activityRepository.save(stallionShortlistActivity);
  }

  @OnEvent('userRegistration')
  async userRegistrationActivity(data) {
    let userRouteLink = `${this.baseUrl}/members/data/${data.originalData.body.fullName}/userFilter`;
    let userRegistration = `<a href="${userRouteLink}" class="systemTooltip">${await this.commonUtilsService.toTitleCase(
      data.originalData.body.fullName,
    )}</a> registered`;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.CREATE,
    );

    let userRegistrationActivity = {
      activityTypeId: activityType?.id,
      farmId: null,
      stallionId: null,
      additionalInfo: userRegistration,
      attributeName: 'farmName',
      newValue: await data?.originalData?.body?.farmName,
      oldValue: await data?.subscribedData?.oldValue,
      ipAddress: clientIp,
      userAgent: data.originalData.headers['user-agent'],
      userName: data.originalData.body.fullName,
      userEmail: data.originalData.body.email,
      userCountryId: data.originalData.body.countryId,
      createdBy: null,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'Users',
      reportType: null,
      entityId: null,
    };
    await this.activityRepository.save(userRegistrationActivity);
  }

  @OnEvent('removeShortList')
  async removeShortListActivity(data) {
    let user = await this.membersService.findOneForActivityBymemberId(
      data.originalData.user.id,
    );
    const { stallionId, reasonId } = data.originalData.params;
    let stallion = await this.stallionsService.getStallionWithFarm(stallionId);

    let horseRouteLink = `${
      this.baseUrl
    }/horsedetails/data/${await this.commonUtilsService.toTitleCase(
      stallion?.horseName,
    )}/horsefilter`;
    let userRouteLink = `${this.baseUrl}/members/data/${
      (await user).fullName
    }/userFilter`;

    let removeShortList = `<a href="${userRouteLink}" class="systemTooltip">${
      (await user).fullName
    }</a> removed <a href="${horseRouteLink}" class="systemTooltip">${await this.commonUtilsService.toTitleCase(
      stallion.horseName,
    )}</a> to their shortlist`;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.DELETE,
    );

    let removeShortListAcitivity = {
      activityTypeId: activityType?.id,
      farmId: stallion?.farmId,
      stallionId: stallion?.stallionId,
      additionalInfo: removeShortList,
      attributeName: await data?.subscribedData?.key,
      newValue: await data?.subscribedData?.newValue,
      oldValue: await data?.subscribedData?.oldValue,
      ipAddress: clientIp,
      userAgent: data.originalData.headers['user-agent'],
      userName: user.fullName,
      userEmail: user.email,
      userCountryId: user.countryId,
      createdBy: user.id,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'Stallions',
      reportType: null,
      entityId: null,
    };
    await this.activityRepository.save(removeShortListAcitivity);
  }

  @OnEvent('farmDirectorySearch')
  async farmDirectorySearchActivity(data) {}

  @OnEvent('sendingMessageToFarm')
  async sendingMessageToFarmActivity(data) {
    let user = await this.membersService.findName(data?.originalData?.user.id);
    const { farmId } = data?.originalData?.body;
    let farm;
    if (farmId) {
      farm = await this.farmService.findOne({ farmUuid: farmId });
    }
    let member = await this.memberAddressService.findMemberInfo(await user);
    let memberAddress = await this.countryService.findByCountryId(
      member?.countryId,
    );
    let memberInfo = await this.membersService.findName(await member.memberId);

    let stallionObj = data.originalData.body;

    const searchString = 'stallionId';
    let foundString: string | undefined;

    // Loop through the object's properties to find the search string
    for (const key of Object.keys(stallionObj)) {
      if (key === searchString) {
        foundString = stallionObj[key];
        break;
      }
    }

    if (foundString) {
      this.stallionData = await foundString;
    } else {
      this.stallionData = null;
    }

    let routeLink = `${
      this.baseUrl
    }/farms/data/${await this.commonUtilsService.toTitleCase(
      (
        await farm
      ).farmName,
    )}/filter`;
    let userRouteLink = `${this.baseUrl}/members/data/${
      (await user).fullName
    }/userFilter`;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.CREATE,
    );

    let sendMessageToFarm = {
      activityTypeId: activityType?.id,
      farmId: data?.originalData?.body?.farmId,
      stallionId: this.stallionData,
      additionalInfo: `<a href="${userRouteLink}" class="systemTooltip">${
        (await user).fullName
      }</a> sent message to <a href="${routeLink}" class="systemTooltip"> ${await this.commonUtilsService.toTitleCase(
        farm?.farmName,
      )}</a> ${member == undefined ? '' : 'from'} ${
        member == undefined ? '' : await memberAddress.countryName
      }`,
      attributeName: 'message',
      newValue: await data.originalData.body.message,
      oldValue: await data?.subscribedData?.oldValue,
      ipAddress: clientIp,
      userAgent: data.originalData.headers['user-agent'],
      userName: user.fullName,
      userEmail: user.email,
      userCountryId: member.countryId,
      createdBy: user.id,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'Messages',
      reportType: null,
      entityId: memberInfo?.memberuuid,
    };
    await this.activityRepository.save(sendMessageToFarm);
  }

  @OnEvent('createNewFarm')
  async createNewFarmActivity(data) {
    let user = await this.membersService.findName(data.originalData.user.id);
    let member = await this.memberAddressService.findMemberInfo(await user);
    let memberAddress = await this.countryService.findByCountryId(
      member.countryId,
    );
    let memberInfo = await this.membersService.findName(await member.memberId);

    let routeLink = `${
      this.baseUrl
    }/farms/data/${await this.commonUtilsService.toTitleCase(
      data.originalData.body.farmName,
    )}/filter`;
    let userRouteLink = `${this.baseUrl}/members/data/${
      (await user).fullName
    }/userFilter`;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.CREATE,
    );

    let createNewFarmActivity = {
      activityTypeId: activityType?.id,
      farmId: data.originalData.body.farmId,
      stallionId: data.originalData.body.stallionId,
      additionalInfo: `<a href="${userRouteLink}" class="systemTooltip">${
        (await user).fullName
      }</a> registered <a href="${routeLink}" class="systemTooltip">${await this.commonUtilsService.toTitleCase(
        data.originalData.body.farmName,
      )}</a>  - requires verification`,
      attributeName: await data?.subscribedData?.key,
      newValue: await data.originalData.body.message,
      oldValue: await data?.subscribedData?.oldValue,
      ipAddress: clientIp,
      userAgent: data.originalData.headers['user-agent'],
      userName: user.fullName,
      userEmail: user.email,
      userCountryId: member.countryId,
      createdBy: user.id,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'Messages',
      reportType: null,
      entityId: memberInfo?.memberuuid,
    };
    await this.activityRepository.save(createNewFarmActivity);
  }

  @OnEvent('deleteFarm')
  async deleteFarmActivity(data) {
    let user = await this.membersService.findName(data.originalData.user.id);
    let farm = this.farmService.getFarmByUuid(data.originalData.body.farmId);
    let member = await this.memberAddressService.findMemberInfo(await user);
    let memberAddress = await this.countryService.findByCountryId(
      member.countryId,
    );
    let memberInfo = await this.membersService.findName(await member.memberId);
    let routeLink = `${this.baseUrl}/farms/data/${
      (await farm).farmName
    }/filter`;
    let userRouteLink = `${this.baseUrl}/members/data/${
      (await user).fullName
    }/userFilter`;

    let deleteFarm = `<a href="${userRouteLink}" class="systemTooltip">${
      (await user).fullName
    }</a> removed <a href="${routeLink}" class="systemTooltip">${
      (await farm).farmName
    }</a> to their My Farms list from ${memberAddress.countryName}`;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.DELETE,
    );

    let deleteFarmActivity = {
      activityTypeId: activityType?.id,
      farmId: data.originalData.body.farmId,
      stallionId: data?.originalData?.params?.stallionId,
      additionalInfo: deleteFarm,
      attributeName: await data?.subscribedData?.key,
      newValue: await data?.subscribedData?.newValue,
      oldValue: await data?.subscribedData?.oldValue,
      ipAddress: clientIp,
      userAgent: data.originalData.headers['user-agent'],
      userName: user.fullName,
      userEmail: user.email,
      userCountryId: member.countryId,
      createdBy: user.id,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'Farms',
      reportType: null,
      entityId: memberInfo?.memberuuid,
    };
    await this.activityRepository.save(deleteFarmActivity);
  }

  @OnEvent('addMareToList')
  async addedMareToListActivity(data) {
    let user = await this.membersService.findName(data.originalData.user.id);
    let member = await this.memberAddressService.findMemberInfo(await user);
    let horse = this.horseService.findHorsesByUuid(
      await data.originalData.body.horseId,
    );
    let horseName = (await horse).horseName;
    let memberAddress = await this.countryService.findByCountryId(
      member.countryId,
    );

    let horseRouteLink = `${
      this.baseUrl
    }/horsedetails/data/${await this.commonUtilsService.toTitleCase(
      horseName,
    )}/horsefilter`;
    let userRouteLink = `${this.baseUrl}/members/data/${
      (await user).fullName
    }/userFilter`;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.CREATE,
    );

    let addedMareToListActivity = {
      activityTypeId: activityType?.id,
      farmId: null,
      stallionId: null,
      additionalInfo: `<a href="${userRouteLink}" class="systemTooltip">${
        (await user).fullName
      }</a> added <a href="${horseRouteLink}" class="systemTooltip">${await this.commonUtilsService.toTitleCase(
        await horseName,
      )}</a> to their My Mares list from ${await memberAddress.countryName}`,
      attributeName: await data?.subscribedData?.key,
      newValue: await data.originalData.body.message,
      oldValue: await data?.subscribedData?.oldValue,
      ipAddress: clientIp,
      userAgent: data.originalData.headers['user-agent'],
      userName: user.fullName,
      userEmail: user.email,
      userCountryId: member.countryId,
      createdBy: user.id,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'Mares',
      reportType: null,
      entityId: user?.memberuuid,
    };
    await this.activityRepository.save(addedMareToListActivity);
  }

  @OnEvent('stallionRequest')
  async stallionRequestActivity(data) {
    let user = await this.membersService.findName(await data.originalData.user.id);
    let member = await this.memberAddressService.findMemberInfo(await user);
    
    let memberInfo = await this.membersService.findName(await member.memberId);

    let horseRouteLink = `${this.baseUrl }/horsedetails/data/${await data.originalData.requestId}/addnewforstallion`;
    let userRouteLink = `${this.baseUrl}/members/data/${
      (await user).fullName
    }/userFilter`;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.CREATE,
    );

    let stallionRequestActivity = {
      activityTypeId: activityType?.id,
      farmId: null,
      stallionId: null,
      additionalInfo: `<a href="${userRouteLink}" class="systemTooltip">${
        await this.commonUtilsService.toTitleCase(user?.fullName)
      }</a> has requested a stallion, <a href="${horseRouteLink}" class="systemTooltip">${await this.commonUtilsService.toTitleCase(
        await data.originalData.body.horseName,
      )}</a> be added to their farm`,
      attributeName: 'horseName',
      newValue: await this.commonUtilsService.toTitleCase(
        await data.originalData.body.horseName,
      ),
      ipAddress: clientIp,
      userAgent: data.originalData.headers['user-agent'],
      userName: user.fullName,
      userEmail: user.email,
      userCountryId: member.countryId,
      createdBy: user.id,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'Stallions',
      reportType: null,
      entityId: memberInfo?.memberuuid,
    };
    await this.activityRepository.save(stallionRequestActivity);
  }

  @OnEvent('mareRequest')
  async mareRequest(data) {
    let user = await this.membersService.findName(await data.originalData.user.id);
    let member = await this.memberAddressService.findMemberInfo(await user);
    
    let memberInfo = await this.membersService.findName(await member.memberId);

    let horseRouteLink = `${this.baseUrl }/horsedetails/data/${await data.originalData.requestId}/addnewformare`;
    let userRouteLink = `${this.baseUrl}/members/data/${
      (await user).fullName
    }/userFilter`;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.CREATE,
    );

    let mareRequestActivity = {
      activityTypeId: activityType?.id,
      farmId: null,
      stallionId: null,
      additionalInfo: `<a href="${userRouteLink}" class="systemTooltip">${
        await this.commonUtilsService.toTitleCase(user?.fullName)
      }</a> has submitted a new mare for review <a href="${horseRouteLink}" class="systemTooltip">${await this.commonUtilsService.toTitleCase(
        await data.originalData.body.horseName,
      )}</a>`,
      attributeName: 'horseName',
      newValue: await this.commonUtilsService.toTitleCase(
        await data.originalData.body.horseName,
      ),
      ipAddress: clientIp,
      userAgent: data.originalData.headers['user-agent'],
      userName: user.fullName,
      userEmail: user.email,
      userCountryId: member.countryId,
      createdBy: user.id,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'Mares',
      reportType: null,
      entityId: memberInfo?.memberuuid,
    };
    await this.activityRepository.save(mareRequestActivity);
  }

  @OnEvent('deleteMemberMares')
  async deleteMemberMaresActivity(data) {
    let user = await this.membersService.findName(data.originalData.user.id);
    let member = await this.memberAddressService.findMemberInfo(await user);
    let memberInfo = await this.membersService.findName(await member.memberId);
    let memberAddress = await this.countryService.findByCountryId(
      member.countryId,
    );
    let horse = this.horseService.findHorsesByUuid(
      await data.originalData.body.horseId,
    );
    let horseName = (await horse).horseName;

    let horseRouteLink = `${
      this.baseUrl
    }/horsedetails/data/${await this.commonUtilsService.toTitleCase(
      await horseName,
    )}/horsefilter`;
    let userRouteLink = `${this.baseUrl}/members/data/${
      (await user).fullName
    }/userFilter`;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.DELETE,
    );

    let deleteMemberMaresActivity = {
      activityTypeId: activityType?.id,
      farmId: data.originalData.params.farmId,
      stallionId: data?.originalData?.params?.stallionId,
      additionalInfo: `<a href="${userRouteLink}" class="systemTooltip">${
        (await user).fullName
      }</a> removed <a href="${horseRouteLink}" class="systemTooltip">${await this.commonUtilsService.toTitleCase(
        await horseName,
      )}</a> to their My Mares list from ${await memberAddress.countryName}`,
      attributeName: 'horseName',
      newValue: await this.commonUtilsService.toTitleCase(await horseName),
      oldValue: await data?.subscribedData?.oldValue,
      ipAddress: clientIp,
      userAgent: data.originalData.headers['user-agent'],
      userName: user.fullName,
      userEmail: user.email,
      userCountryId: member.countryId,
      createdBy: user.id,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'Members',
      reportType: null,
      entityId: memberInfo?.memberuuid,
    };
    await this.activityRepository.save(deleteMemberMaresActivity);
  }

  @OnEvent('resendInvitation')
  async resendInvitationActivity(data) {
    let user = await this.membersService.findOneForActivityBymemberId(
      data.originalData.user.id,
    );
    let farm = this.farmService.getFarmByUuid(data.originalData.body.farmId);
    let farmName = (await farm).farmName;

    let userRouteLink = `${this.baseUrl}/members/data/${
      (await user).fullName
    }/userFilter`;
    let routeLink = `${
      this.baseUrl
    }/farms/data/${await this.commonUtilsService.toTitleCase(farmName)}/filter`;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.CREATE,
    );

    let createNewFarmActivity = {
      activityTypeId: activityType?.id,
      farmId: data.originalData.body.farmId,
      stallionId: data.originalData.body.stallionId,
      additionalInfo: `<a href="${userRouteLink}" class="systemTooltip">${
        (await user).fullName
      }</a> from <a href="${routeLink}" class="systemTooltip">${await this.commonUtilsService.toTitleCase(
        farmName,
      )}</a> resent invitation`,
      attributeName: 'farmName',
      newValue: await this.commonUtilsService.toTitleCase(farmName),
      oldValue: await data?.subscribedData?.oldValue,
      ipAddress: clientIp,
      userAgent: data.originalData.headers['user-agent'],
      userName: user.fullName,
      userEmail: user.email,
      userCountryId: user.countryId,
      createdBy: user.id,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'Users',
      reportType: null,
      entityId: null,
    };
    await this.activityRepository.save(createNewFarmActivity);
  }

  @OnEvent('updateUserAddress')
  async updateUserAddressActivity(data) {
    let user = await this.membersService.findOneForActivityBymemberId(
      data.originalData.user.id,
    );
    let userRouteLink = `${this.baseUrl}/members/data/${
      (await user).fullName
    }/userFilter`;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.UPDATE,
    );
    let memberAddress = await this.countryService.findByCountryId(
      await data?.originalData?.body?.countryId,
      );

    let oldmemberAddress = await this.countryService.findByCountryId(
      await data?.countryId,
      );

    let updateUserAddressActivity = {
      activityTypeId: activityType?.id,
      farmId: null,
      stallionId: null,
      additionalInfo: `<a href="${userRouteLink}" class="systemTooltip">${await this.commonUtilsService.toTitleCase(
          user?.fullName,
      )}</a> updated their country from ${oldmemberAddress?.countryName} to ${memberAddress?.countryName}`,
      attributeName: 'address',
      newValue: await data?.originalData?.body?.address,
      oldValue: await data?.subscribedData?.oldValue,
      ipAddress: clientIp,
      userAgent: data.originalData.headers['user-agent'],
      userName: user.fullName,
      userEmail: user.email,
      userCountryId: user.countryId,
      createdBy: user.id,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'Users',
      reportType: null,
      entityId: null,
    };
    await this.activityRepository.save(updateUserAddressActivity);
  }

  @OnEvent('memberPaymenttype')
  async memberPaymenttypeActivity(data) {
    let user = await this.membersService.findOneForActivityBymemberId(
      data.originalData.user.id,
    );
    let payment = await this.paymentTypeService.findPaymentType(
      data.originalData.body.paymentMethod,
    );
    let userRouteLink = `${this.baseUrl}/members/data/${
      (await user).fullName
    }/userFilter`;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.CREATE,
    );

    let memberPaymenttypeActivity = {
      activityTypeId: activityType?.id,
      farmId: null,
      stallionId: null,
      additionalInfo: `<a href="${userRouteLink}" class="systemTooltip">${
        (await user).fullName
      }</a> added ${await this.commonUtilsService.toTitleCase(
        await payment.paymentMethod,
      )} as a new payment method`,
      attributeName: 'addPaymentMethod',
      newValue: await payment.paymentMethod,
      oldValue: await data?.subscribedData?.oldValue,
      ipAddress: clientIp,
      userAgent: data.originalData.headers['user-agent'],
      userName: user.fullName,
      userEmail: user.email,
      userCountryId: user.countryId,
      createdBy: user.id,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'Users',
      reportType: null,
      entityId: null,
    };
    await this.activityRepository.save(memberPaymenttypeActivity);
  }

  @OnEvent('deleteMemberPaymentType')
  async deleteMemberPaymentTypeActivity(data) {
    let user = await this.membersService.findOneForActivityBymemberId(
      data.originalData.user.id,
    );
    let payment = await this.paymentTypeService.findPaymentType(
      data.originalData.body.paymentMethod,
    );
    let userRouteLink = `${this.baseUrl}/members/data/${
      (await user).fullName
    }/userFilter`;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.DELETE,
    );

    let deleteMemberMaresActivity = {
      activityTypeId: activityType?.id,
      farmId: data.originalData.params.farmId,
      stallionId: data?.originalData?.params?.stallionId,
      additionalInfo: `<a href="${userRouteLink}" class="systemTooltip">${
        (await user).fullName
      }</a> removed ${await this.commonUtilsService.toTitleCase(
        await payment.paymentMethod,
      )} as a payment method`,
      attributeName: 'deletepaymentMethod',
      newValue: await payment.paymentMethod,
      oldValue: await data?.subscribedData?.oldValue,
      ipAddress: clientIp,
      userAgent: data.originalData.headers['user-agent'],
      userName: user.fullName,
      userEmail: user.email,
      userCountryId: user.countryId,
      createdBy: user.id,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'Users',
      reportType: null,
      entityId: null,
    };
    await this.activityRepository.save(deleteMemberMaresActivity);
  }

  @OnEvent('updatePaymentType')
  async paymentDefaultActivity(data) {
    let user = await this.membersService.findOneForActivityBymemberId(
      data.originalData.user.id,
    );
    let payment = await this.paymentTypeService.findPaymentType(
      data.originalData.body.paymentMethod,
    );
    let userRouteLink = `${this.baseUrl}/members/data/${
      (await user).fullName
    }/userFilter`;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.UPDATE,
    );

    let updatePaymentTypeActivity = {
      activityTypeId: activityType?.id,
      farmId: null,
      stallionId: null,
      additionalInfo: `<a href="${userRouteLink}" class="systemTooltip">${
        (await user).fullName
      }</a> made ${await payment.paymentMethod} their default`,
      attributeName: 'updatePaymentMethod',
      newValue: await payment.paymentMethod,
      oldValue: await data?.subscribedData?.oldValue,
      ipAddress: clientIp,
      userAgent: data.originalData.headers['user-agent'],
      userName: user.fullName,
      userEmail: user.email,
      userCountryId: user.countryId,
      createdBy: user.id,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'Users',
      reportType: null,
      entityId: null,
    };
    await this.activityRepository.save(updatePaymentTypeActivity);
  }

  @OnEvent('transactionOrderId')
  async transactionOrderIdActivity(data) {
    const clientIp = requestIp.getClientIp(await data?.originalData);
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.READ,
    );

    const orderProduct = await getRepository(Order).createQueryBuilder('order')
      .select('order.id as orderId, order.fullName as fullName, order.email as email')
      .addSelect('orderProduct.productId as productId')
      .addSelect('product.productName as productName')
      .innerJoin('order.orderProduct','orderProduct')
      .innerJoin('orderProduct.product','product')
      .andWhere('order.sessionId = :sessionId',{sessionId:data.originalData.params?.transactionId})
      .getRawMany();

      await orderProduct.forEach(async (item,index)=>{
        if(!index){
          let orderIdActivity = {
            activityTypeId: activityType?.id,
            farmId: null,
            stallionId: null,
            additionalInfo: `A report order has been paid for - ${item.orderId}`,
            attributeName: 'transactionId',
            newValue: await data.originalData.params.transactionId,
            oldValue: await data?.subscribedData?.oldValue,
            ipAddress: clientIp,
            userAgent: data.originalData.headers['user-agent'],
            createdBy: null,
            createdOn: new Date(),
            userName: item?.fullName,
            userEmail: item?.email, 
            result: 'Success',
            activityModule: 'Users',
            reportType: item.productId,
            entityId: null,
          };

          await this.activityRepository.save(orderIdActivity);
        }
        let orderIdActivity = {
          activityTypeId: activityType?.id,
          farmId: null,
          stallionId: null,
          additionalInfo: `A ${item.productName} has been ordered.`,
          attributeName: 'transactionId',
          newValue: await data.originalData.params.transactionId,
          oldValue: await data?.subscribedData?.oldValue,
          ipAddress: clientIp,
          userAgent: data.originalData.headers['user-agent'],
          createdBy: null,
          createdOn: new Date(),
          userName: item?.fullName,
          userEmail: item?.email,
          result: 'Success',
          activityModule: 'Users',
          reportType: item.productId,
          entityId: null,
        };

        await this.activityRepository.save(orderIdActivity);
      })
  }

  @OnEvent('loginSuccessful')
  async loginSuccessfulActivity(data) {
    const clientIp = requestIp.getClientIp(await data?.originalData);
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.CREATE,
    );

    let loginSuccessfulActivity = {
      activityTypeId: activityType?.id,
      farmId: null,
      stallionId: null,
      additionalInfo: `${await data.originalData.body
        .email} successfully signed in`,
      attributeName: 'email',
      newValue: await data.originalData.body.email,
      oldValue: await data?.subscribedData?.oldValue,
      ipAddress: clientIp,
      userAgent: data.originalData.headers['user-agent'],
      createdBy: null,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'Users',
      reportType: null,
      entityId: null,
    };
    await this.activityRepository.save(loginSuccessfulActivity);
  }

  @OnEvent('resendEmailInvite')
  async resendEmailInviteActivity(data) {
    const clientIp = requestIp.getClientIp(await data?.originalData);
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.CREATE,
    );

    let resendEmailInviteActivity = {
      activityTypeId: activityType?.id,
      farmId: null,
      stallionId: null,
      additionalInfo: `${await data.originalData.body
        .email} requested a forgot password email `,
      attributeName: 'resendEmail',
      newValue: await data.originalData.body.email,
      oldValue: await data?.subscribedData?.oldValue,
      ipAddress: clientIp,
      userAgent: data.originalData.headers['user-agent'],
      createdBy: null,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'Users',
      reportType: null,
      entityId: null,
    };
    await this.activityRepository.save(resendEmailInviteActivity);
  }

  @OnEvent('smSearchStallionMare')
  async smSearchStallionMareActivity(data) {
    let user;
    let userRouteLink;
    if (data?.originalData?.user) {
      user = await this.membersService.findOneForActivityBymemberId(
        data?.originalData?.user?.id,
      );
      userRouteLink = `${this.baseUrl}/members/data/${
        (await user).fullName
      }/userFilter`;
    }
    let stallion = await this.stallionsService.getStallionWithFarm(
      data.originalData.params.stallionId,
    );
    let mare = await this.horseService.findHorsesByUuid(
      data.originalData.params.mareId,
    );
    let additionalInfo;

    let horseRouteLink = `${
      this.baseUrl
    }/horsedetails/data/${await this.commonUtilsService.toTitleCase(
      (
        await stallion
      ).horseName,
    )}/horsefilter`;

    let mareRouteLink = `${this.baseUrl}/horsedetails/data/${mare?.horseName}/horsefilter`;

    if (data?.originalData?.user) {
      additionalInfo = `<a href="${userRouteLink}" class="systemTooltip">${
        await this.commonUtilsService.toTitleCase(user?.fullName)
      }</a> completed a SM search <a href="${horseRouteLink}" class="systemTooltip">${
        await this.commonUtilsService.toTitleCase(stallion?.horseName)
      }</a> x <a href="${mareRouteLink}" class="systemTooltip"> ${await this.commonUtilsService.toTitleCase(mare?.horseName)}</a>`;
    } else {
      additionalInfo = `Anonymous user Completed a SM search <a href="${horseRouteLink}" class="systemTooltip">${await this.commonUtilsService.toTitleCase(
        stallion?.horseName,
      )}</a> x <a href="${mareRouteLink}" class="systemTooltip"> ${await this.commonUtilsService.toTitleCase(
        mare?.horseName,
      )}</a>`;
    }

    if(data?.originalData?.query?.countryName != null && data?.originalData?.query?.countryName != '' && data?.originalData?.query?.countryName != 'null'){
      additionalInfo = additionalInfo + ` from ${data?.originalData?.query?.countryName}`
    }
    const clientIp = requestIp.getClientIp(await data?.originalData);
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.READ,
    );

    let smSearchStallionMareActivity = {
      activityTypeId: activityType?.id,
      farmId: await stallion.farmId,
      stallionId: data?.originalData?.params?.stallionId,
      additionalInfo: additionalInfo,
      attributeName: await data?.subscribedData?.key,
      newValue: await data?.subscribedData?.newValue,
      oldValue: await data?.subscribedData?.oldValue,
      ipAddress: clientIp,
      userAgent: data.originalData.headers['user-agent'],
      userName: user ? user.fullName : 'Anonymous user',
      userEmail: user ? user.email : null,
      userCountryId: user ? user.countryId : null,
      createdBy: user ? user.id : null,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'Search',
      reportType: null,
      entityId: await mare.horseUuid,
    };
    await this.activityRepository.save(smSearchStallionMareActivity);
  }

  @OnEvent('emailInsigtsReport')
  async emailInsigtsReportActivity(data) {
    let user = data.originalData.body.email;
    let userExists;
    if (data?.originalData?.user?.id != undefined) {
      userExists = await this.membersService.findOneForActivityBymemberId(
        data?.originalData?.user?.id,
      );
    }
    const clientIp = requestIp.getClientIp(await data?.originalData);
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.CREATE,
    );

    let emailInsigtsReportActivity = {
      activityTypeId: activityType?.id,
      farmId: null,
      stallionId: null,
      additionalInfo: `${
        userExists ? (await userExists).id : user
      } registered for email insights`,
      attributeName: 'email',
      newValue: await data.originalData.body.email,
      oldValue: await data?.subscribedData?.oldValue,
      ipAddress: clientIp,
      userAgent: data.originalData.headers['user-agent'],
      userName: userExists ? userExists.fullName : null,
      userEmail: userExists ? userExists.email : null,
      userCountryId: userExists ? userExists.countryId : null,
      createdBy: userExists ? userExists.id : null,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'Users',
      reportType: null,
      entityId: null,
    };
    await this.activityRepository.save(emailInsigtsReportActivity);
  }

  @OnEvent('contactUs')
  async contactUsActivity(data) {
    const clientIp = requestIp.getClientIp(await data?.originalData);
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.CREATE,
    );

    let contactUsActivity = {
      activityTypeId: activityType?.id,
      farmId: null,
      stallionId: null,
      additionalInfo: `${data.originalData.body.contactEmail} completed the contact form`,
      attributeName: 'contactEmail',
      newValue: await data.originalData.body.contactEmail,
      oldValue: await data?.subscribedData?.oldValue,
      ipAddress: clientIp,
      userAgent: data.originalData.headers['user-agent'],
      createdBy: null,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'Users',
      reportType: null,
      entityId: null,
    };
    await this.activityRepository.save(contactUsActivity);
  }

  @OnEvent('favouriteBroodmareSires')
  async favouriteBroodmareSiresActivity(data) {
    let user = await this.membersService.findOneForActivityBymemberId(
      data.originalData.user.id,
    );
    let horse = this.horseService.findHorsesByUuid(
      await data.originalData.body.horseId,
    );
    let horseName = await this.commonUtilsService.toTitleCase(
      (
        await horse
      ).horseName,
    );

    let userRouteLink = `${this.baseUrl}/members/data/${
      (await user).fullName
    }/userFilter`;
    let horseRouteLink = `${this.baseUrl}/horsedetails/data/${horseName}/horsefilter`;
    let member = await this.memberAddressService.findMemberInfo(await user);
    let memberInfo = await this.membersService.findName(await member.memberId);
    let memberAddress = await this.countryService.findByCountryId(
      member.countryId,
    );
    const clientIp = requestIp.getClientIp(await data?.originalData);
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.CREATE,
    );

    let mareRequestsActivity = {
      activityTypeId: activityType?.id,
      farmId: null,
      stallionId: null,
      additionalInfo: `<a href="${userRouteLink}" class="systemTooltip">${
        (await user).fullName
      }</a> added <a href="${horseRouteLink}" class="systemTooltip">${horseName}</a> to their Broodmare Sire favourites from ${
        memberAddress.countryName
      }`,
      attributeName: 'horseName',
      newValue: horseName,
      oldValue: await data?.subscribedData?.oldValue,
      ipAddress: clientIp,
      userAgent: data.originalData.headers['user-agent'],
      userName: user ? user.fullName : null,
      userEmail: user ? user.email : null,
      userCountryId: user ? user.countryId : null,
      createdBy: user.id,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'Users',
      reportType: null,
      entityId: memberInfo.memberuuid,
    };
    await this.activityRepository.save(mareRequestsActivity);
  }

  @OnEvent('favouriteBroodmareSiresDelete')
  async favouriteBroodmareSiresDeleteActivity(data) {
    let user = await this.membersService.findOneForActivityBymemberId(
      data.originalData.user.id,
    );
    let horse = this.horseService.findHorsesByUuid(
      await data.originalData.body.horseId,
    );
    let horseName = await this.commonUtilsService.toTitleCase(
      (
        await horse
      ).horseName,
    );

    let userRouteLink = `${this.baseUrl}/members/data/${user.fullName}/userFilter`;
    let horseRouteLink = `${this.baseUrl}/horsedetails/data/${horseName}/horsefilter`;
    let member = await this.memberAddressService.findMemberInfo(await user);
    let memberInfo = await this.membersService.findName(await member.memberId);
    let memberAddress = await this.countryService.findByCountryId(
      member.countryId,
    );
    const clientIp = requestIp.getClientIp(await data?.originalData);
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.DELETE,
    );

    let favouriteBroodmareSiresDeleteActivity = {
      activityTypeId: activityType?.id,
      farmId: data.originalData.body.farmId,
      stallionId: data?.originalData?.params?.stallionId,
      additionalInfo: `<a href="${userRouteLink}" class="systemTooltip">${user.fullName}</a> removed <a href="${horseRouteLink}" class="systemTooltip">${horseName}</a> to their Broodmare Sire favourites from ${memberAddress.countryName}`,
      attributeName: 'horseName',
      newValue: horseName,
      oldValue: await data?.subscribedData?.oldValue,
      ipAddress: clientIp,
      userAgent: data.originalData.headers['user-agent'],
      userName: user ? user.fullName : null,
      userEmail: user ? user.email : null,
      userCountryId: user ? user.countryId : null,
      createdBy: (await user).id,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'Users',
      reportType: null,
      entityId: memberInfo.memberuuid,
    };
    await this.activityRepository.save(favouriteBroodmareSiresDeleteActivity);
  }

  @OnEvent('changeAccessLevel')
  async changeAccessLevelActivity(data) {
    let user = await this.membersService.findOneForActivityBymemberId(
      data.originalData.user.id,
    );
    let userRouteLink = `${this.baseUrl}/members/data/${
      (await user).fullName
    }/userFilter`;
    let memberInvitation =
      await this.memberInvitationService.findMemberInvitationFromId(
        data.originalData.body.memberInvitationId,
      );
    let accessLevelNew = await this.farmAccessLevelId.findOne(
      await memberInvitation.accessLevelId,
    );
    let accessLevelOld = await this.farmAccessLevelId.findOne(
      await data.subscribedData?.accessLevelId,
    );

    let farm = this.farmService.getFarmByUuid(data.originalData.body.farmId);
    let farmName = (await farm).farmName;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.UPDATE,
    );

    let changeAccessLevelActivity = {
      activityTypeId: activityType?.id,
      farmId: data.originalData.body.farmId,
      stallionId: null,
      additionalInfo: `<a href="${userRouteLink}" class="systemTooltip">${await this.commonUtilsService.toTitleCase(
        user?.fullName,
      )}</a> from ${farmName} updated access level of <a href="${userRouteLink}" class="systemTooltip">${await this.commonUtilsService.toTitleCase(
        memberInvitation.fullName,
      )}</a> from ${accessLevelOld.accessName} to ${accessLevelNew?.accessName}`,
      attributeName: 'accessLevel',
      newValue: accessLevelNew?.accessName,
      oldValue: accessLevelOld.accessName,
      ipAddress: clientIp,
      userAgent: data.originalData.headers['user-agent'],
      userName: user ? user.fullName : null,
      userEmail: user ? user.email : null,
      userCountryId: user ? user.countryId : null,
      createdBy: (await user).id,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'Users',
      reportType: null,
      entityId: null,
    };
    await this.activityRepository.save(changeAccessLevelActivity);
  }

  @OnEvent('deleteMemberInvitation')
  async deleteMemberInvitationActivity(data) {
    let user = await this.membersService.findOneForActivityBymemberId(
      data.originalData.user.id,
    );
    let farm = await this.farmService.getFarmByUuid(
      data.originalData.body.farmId,
    );
    let routeLink = `${
      this.baseUrl
    }/farms/data/${await this.commonUtilsService.toTitleCase(
      (
        await farm
      ).farmName,
    )}/filter`;
    let userRouteLink = `${this.baseUrl}/members/data/${
      (await user).fullName
    }/userFilter`;
    const fullname = data.subscribedData.fullName
    let deleteMemberInvitation = `<a href="${userRouteLink}" class="systemTooltip">${user.fullName}</a> removed <a href="${userRouteLink}" class="systemTooltip">${fullname}</a> from <a href="${routeLink}" class="systemTooltip">${farm.farmName}</a>`;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.DELETE,
    );

    let deleteMemberInvitationActivity = {
      activityTypeId: activityType?.id,
      farmId: data.originalData.body.farmId,
      stallionId: data?.originalData?.params?.stallionId,
      additionalInfo: deleteMemberInvitation,
      attributeName: await data?.subscribedData?.key,
      newValue: await data?.subscribedData?.newValue,
      oldValue: await data?.subscribedData?.oldValue,
      ipAddress: clientIp,
      userAgent: data.originalData.headers['user-agent'],
      userName: user ? user.fullName : null,
      userEmail: user ? user.email : null,
      userCountryId: user ? user.countryId : null,
      createdBy: (await user).id,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'Farms',
      reportType: null,
      entityId: null,
    };
    await this.activityRepository.save(deleteMemberInvitationActivity);
  }

  @OnEvent('stallionViewReport')
  async stallionViewReportActivity(data) {
    let user;
    let userRouteLink;

    if (data?.originalData?.user) {
      user = await this.membersService.findOneForActivityBymemberId(
        data?.originalData?.user?.id,
      );
      userRouteLink = `${this.baseUrl}/members/data/${
        (await user).fullName
      }/userFilter`;
    }

    let stallion = await this.stallionsService.getStallionWithFarm(
      data.originalData.params.stallionId,
    );
    let horse = await this.horseService.findHorseById(await stallion.horseId);
    let farm = await this.farmService.getFarmByUuid(stallion?.farmId);
    let routeLink = `${
      this.baseUrl
    }/farms/data/${await this.commonUtilsService.toTitleCase(
      farm.farmName,
    )}/filter`;
    let horseRouteLink = `${
      this.baseUrl
    }/horsedetails/data/${await this.commonUtilsService.toTitleCase(
      (
        await stallion
      ).horseName,
    )}/horsefilter`;

    let stallionViewReport = `<a href="${userRouteLink}" class="systemTooltip">${
      (await user).fullName
    }</a> from <a href="${routeLink}" class="systemTooltip">${
      await this.commonUtilsService.toTitleCase(farm.farmName)
    }</a> has viewed <a href="${horseRouteLink}" class="systemTooltip">${await this.commonUtilsService.toTitleCase(
      stallion.horseName,
    )}’s</a> report`;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.READ,
    );

    let stallionViewReportActivity = {
      activityTypeId: activityType?.id,
      farmId: await stallion.farmId,
      stallionId: data?.originalData?.params?.stallionId,
      additionalInfo: stallionViewReport,
      attributeName: await data?.subscribedData?.key,
      newValue: await data?.subscribedData?.newValue,
      oldValue: await data?.subscribedData?.oldValue,
      ipAddress: clientIp,
      userAgent: data.originalData.headers['user-agent'],
      userName: user ? user.fullName : null,
      userEmail: user ? user.email : null,
      userCountryId: user ? user.countryId : null,
      createdBy: user ? user.id : null,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'Stallions',
      reportType: null,
      entityId: horse.horseUuid,
    };
    await this.activityRepository.save(stallionViewReportActivity);
  }

  @OnEvent('userViewedStallion')
  async userViewedStallionActivity(data) {
    let user, stallion;
    let stallionId = data?.originalData?.params?.stallionId
    if(data.originalData?.user?.id){
      user = await this.membersService.findOneForActivityBymemberId(
        data.originalData?.user?.id,
      );
    }

    console.log('=========== stallionId',stallionId)

    stallion = await getRepository(Stallion).createQueryBuilder('stallion')
      .select('stallion.id as id')
      .addSelect('farm.farmName as farmName')
      .addSelect('horse.horseName as horseName')
      .innerJoin('stallion.horse', 'horse')
      .innerJoin('stallion.farm','farm')
      .andWhere('stallion.stallionUuid = :stallionId',{ stallionId: stallionId})
      .getRawOne();
 
    let additionalInfo = 'Anonymous';
    let userRoueLink;
    if(user?.fullName){
      userRoueLink = `${
        this.baseUrl
      }/members/data/${await this.commonUtilsService.toTitleCase(
        user?.fullName,
      )}/filter`;
      additionalInfo = `<a href="${userRoueLink}" class="systemTooltip"> ${user?.fullName} </a>`;
    }

    let stallinRouteLink = `${
      this.baseUrl
    }/stallion/data/${await this.commonUtilsService.toTitleCase(
      stallion?.horseName,
    )}/filter`;
    
    let routeLink = `${
      this.baseUrl
    }/farms/data/${await this.commonUtilsService.toTitleCase(
      stallion?.farmName,
    )}/filter`;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.READ,
    );
    if(data?.originalData?.query?.countryName != null && data?.originalData?.query?.countryName != '' && data?.originalData?.query?.countryName != 'null'){
      additionalInfo = additionalInfo + ` in ${data?.originalData?.query?.countryName} viewed <a href="${stallinRouteLink}" class="systemTooltip">${await this.commonUtilsService.toTitleCase(stallion.horseName)} </a> profile page from <a href="${routeLink}" class="systemTooltip">${await this.commonUtilsService.toTitleCase(stallion.farmName)} </a>`;
    }else{
      additionalInfo = additionalInfo + ` viewed <a href="${stallinRouteLink}" class="systemTooltip">${await this.commonUtilsService.toTitleCase(stallion.horseName)} </a> profile page from <a href="${routeLink}" class="systemTooltip">${await this.commonUtilsService.toTitleCase(stallion.farmName)} </a>`;
    }
    let stallionViewActivity = {
      activityTypeId: activityType?.id,
      farmId: data.originalData.body.farmId,
      stallionId: null,
      additionalInfo: additionalInfo,
      attributeName: 'stallionName',
      newValue: await this.commonUtilsService.toTitleCase(stallion?.horseName),
      oldValue: await data?.subscribedData?.oldValue,
      ipAddress: clientIp,
      userAgent: data.originalData.headers['user-agent'],
      userName: user ? user?.fullName : 'Anonymous',
      userEmail: user ? user.email : null,
      userCountryId: user ? user.countryId : null,
      createdBy: user?.id,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'Stallions',
      reportType: null,
      entityId: null,
    };
    await this.activityRepository.save(stallionViewActivity);
  }

  @OnEvent('nominationRequest')
  async nominationRequestActivity(data) {
    let user = await this.membersService.findOneForActivityBymemberId(
      data.originalData.user.id,
    );
    let stallion = await this.stallionsService.getStallionWithFarm(
      data.originalData.body.stallionId,
    );
    let userRouteLink = `${this.baseUrl}/members/data/${user.fullName}/userFilter`;
    let horseRouteLink = `${
      this.baseUrl
    }/horsedetails/data/${await this.commonUtilsService.toTitleCase(
      stallion.horseName,
    )}/horsefilter`;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.CREATE,
    );

    let nominationRequestActivity = {
      activityTypeId: activityType?.id,
      farmId: data.originalData.body.farmId,
      stallionId: data.originalData.body.stallionId,
      additionalInfo: `<a href="${userRouteLink}" class="systemTooltip">${
        user.fullName
      }</a> has requested a Nomination to <a href="${horseRouteLink}" class="systemTooltip">${await this.commonUtilsService.toTitleCase(
        stallion.horseName,
      )}</a>`,
      attributeName: 'horseName',
      newValue: await this.commonUtilsService.toTitleCase(stallion.horseName),
      oldValue: await data?.subscribedData?.oldValue,
      ipAddress: clientIp,
      userAgent: data.originalData.headers['user-agent'],
      userName: user ? user.fullName : null,
      userEmail: user ? user.email : null,
      userCountryId: user ? user.countryId : null,
      createdBy: user.id,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'Stallions',
      reportType: null,
      entityId: null,
    };
    await this.activityRepository.save(nominationRequestActivity);
  }

  @OnEvent('userViewedFarm')
  async userViewedFarmActivity(data) {
    let user;
    if(data.originalData?.user?.id){
      user = await this.membersService.findOneForActivityBymemberId(
        data.originalData?.user?.id,
      );
    }
    let farm = await this.farmService.getFarmByUuid(
      data.originalData.params?.farmId,
    );
    let routeLink = `${
      this.baseUrl
    }/farms/data/${await this.commonUtilsService.toTitleCase(
      farm.farmName,
    )}/filter`;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.READ,
    );
    let additionalInfo = 'Anonymous';
    let userRoueLink;
    if(user?.fullName){
      userRoueLink = `${
        this.baseUrl
      }/members/data/${await this.commonUtilsService.toTitleCase(
        user?.fullName,
      )}/filter`;
      additionalInfo = `<a href="${userRoueLink}" class="systemTooltip"> ${user?.fullName} </a>`;
    }
    if(data?.originalData?.query?.countryName != null && data?.originalData?.query?.countryName != '' && data?.originalData?.query?.countryName != 'null'){
      additionalInfo = additionalInfo + ` in ${data?.originalData?.query?.countryName} viewed <a href="${routeLink}" class="systemTooltip">${await this.commonUtilsService.toTitleCase(farm.farmName)} </a> profile page`
    }else{
      additionalInfo = additionalInfo + ` viewed <a href="${routeLink}" class="systemTooltip">${await this.commonUtilsService.toTitleCase(farm.farmName)}</a> profile page`
    }
    let farmActivity = {
      activityTypeId: activityType?.id,
      farmId: data.originalData.body.farmId,
      stallionId: null,
      additionalInfo: additionalInfo,
      attributeName: 'farmName',
      newValue: await this.commonUtilsService.toTitleCase(farm.farmName),
      oldValue: await data?.subscribedData?.oldValue,
      ipAddress: clientIp,
      userAgent: data.originalData.headers['user-agent'],
      userName: user ? user?.fullName : 'Anonymous',
      userEmail: user ? user.email : null,
      userCountryId: user ? user.countryId : null,
      createdBy: user?.id,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'Farms',
      reportType: null,
      entityId: null,
    };
    await this.activityRepository.save(farmActivity);
  }

  @OnEvent('favStallions')
  async favStallionsActivity(data) {
    let user = await this.membersService.findOneForActivityBymemberId(
      data.originalData.user.id,
    );
    let stallion = await this.stallionsService.getStallionWithFarm(
      data.originalData.body.stallionId,
    );
    let horseRouteLink = `${
      this.baseUrl
    }/horsedetails/data/${await this.commonUtilsService.toTitleCase(
      stallion.horseName,
    )}/horsefilter`;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.CREATE,
    );

    let favStallionsActivity = {
      activityTypeId: activityType?.id,
      farmId: stallion.farmId,
      stallionId: stallion.stallionId,
      additionalInfo: `Create favorite stallion <a href="${horseRouteLink}" class="systemTooltip">${await this.commonUtilsService.toTitleCase(
        stallion.horseName,
      )}</a>`,
      attributeName: 'horseName',
      newValue: await this.commonUtilsService.toTitleCase(stallion.horseName),
      oldValue: await data?.subscribedData?.oldValue,
      ipAddress: clientIp,
      userAgent: data.originalData.headers['user-agent'],
      userName: user ? user.fullName : null,
      userEmail: user ? user.email : null,
      userCountryId: user ? user.countryId : null,
      createdBy: user.id,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'Stallions',
      reportType: null,
      entityId: null,
    };
    await this.activityRepository.save(favStallionsActivity);
  }

  @OnEvent('deleteFavStallions')
  async deleteFavStallionsActivity(data) {
    let user = await this.membersService.findOneForActivityBymemberId(
      data.originalData.user.id,
    );
    let stallion = await this.stallionsService.getStallionWithFarm(
      data.originalData.body.stallionId,
    );
    let horseRouteLink = `${
      this.baseUrl
    }/horsedetails/data/${await this.commonUtilsService.toTitleCase(
      stallion.horseName,
    )}/horsefilter`;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.DELETE,
    );

    let deleteFavStallionsActivity = {
      activityTypeId: activityType?.id,
      farmId: stallion.farmId,
      stallionId: stallion.stallionId,
      additionalInfo: `Remove favorite stallion <a href="${horseRouteLink}" class="systemTooltip">${await this.commonUtilsService.toTitleCase(
        stallion.horseName,
      )}</a>`,
      attributeName: 'horseName',
      newValue: await this.commonUtilsService.toTitleCase(stallion.horseName),
      oldValue: await data?.subscribedData?.oldValue,
      ipAddress: clientIp,
      userAgent: data.originalData.headers['user-agent'],
      userName: user ? user.fullName : null,
      userEmail: user ? user.email : null,
      userCountryId: user ? user.countryId : null,
      createdBy: user.id,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'Stallions',
      reportType: null,
      entityId: null,
    };
    await this.activityRepository.save(deleteFavStallionsActivity);
  }

  //faviourateFarm

  @OnEvent('faviourateFarm')
  async faviourateFarmActivity(data) {
    let user = await this.membersService.findOneForActivityBymemberId(
      data.originalData.user.id,
    );
    let farm = await this.farmService.getFarmByUuid(
      data.originalData.body?.farmId,
    );
    let routeLink = `${
      this.baseUrl
    }/farms/data/${await this.commonUtilsService.toTitleCase(
      farm.farmName,
    )}/filter`;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.CREATE,
    );

    let faviourateFarmActivity = {
      activityTypeId: activityType?.id,
      farmId: data.originalData.body.farmId,
      stallionId: null,
      additionalInfo: `Create favorite farm <a href="${routeLink}" class="systemTooltip">${await this.commonUtilsService.toTitleCase(
        farm.farmName,
      )}</a>`,
      attributeName: 'farmName',
      newValue: await this.commonUtilsService.toTitleCase(farm.farmName),
      oldValue: await data?.subscribedData?.oldValue,
      ipAddress: clientIp,
      userAgent: data.originalData.headers['user-agent'],
      userName: user ? user.fullName : null,
      userEmail: user ? user.email : null,
      userCountryId: user ? user.countryId : null,
      createdBy: user.id,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'Farms',
      reportType: null,
      entityId: null,
    };
    await this.activityRepository.save(faviourateFarmActivity);
  }

  @OnEvent('deleteFavFarm')
  async deleteFavFarmActivity(data) {
    let user = await this.membersService.findOneForActivityBymemberId(
      data.originalData.user.id,
    );
    let farm = await this.farmService.getFarmByUuid(
      data.originalData.body?.farmId,
    );
    let routeLink = `${
      this.baseUrl
    }/farms/data/${await this.commonUtilsService.toTitleCase(
      farm.farmName,
    )}/filter`;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.DELETE,
    );

    let deleteFavFarmActivity = {
      activityTypeId: activityType?.id,
      farmId: data.originalData.body.farmId,
      stallionId: null,
      additionalInfo: `Remove favorite farm <a href="${routeLink}" class="systemTooltip">${await this.commonUtilsService.toTitleCase(
        farm.farmName,
      )}</a>`,
      attributeName: 'farmName',
      newValue: await this.commonUtilsService.toTitleCase(farm.farmName),
      oldValue: await data?.subscribedData?.oldValue,
      ipAddress: clientIp,
      userAgent: data.originalData.headers['user-agent'],
      userName: user ? user.fullName : null,
      userEmail: user ? user.email : null,
      userCountryId: user ? user.countryId : null,
      createdBy: user.id,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'Farms',
      reportType: null,
      entityId: null,
    };
    await this.activityRepository.save(deleteFavFarmActivity);
  }

  @OnEvent('LoginFailed')
  async LoginFailedActivity(data) {
    const { user } = data.originalData;
    let userRouteLink = `${this.baseUrl}/members/data/${
      user?.fullName
    }/userFilter`;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.READ,
    );
    let loginFailedActivity = {
      activityTypeId: activityType?.id,
      additionalInfo: `<a href="${userRouteLink}" class="systemTooltip">${await this.commonUtilsService.toTitleCase(
        user?.fullName,
      )}</a> failed to sign in`,
      ipAddress: clientIp,
      userAgent: data.originalData.headers['user-agent'],
      userName: user ? user.fullName : null,
      userEmail: user ? user.email : null,
      userCountryId: user ? user.countryId : null,
      createdBy: user.id,
      createdOn: new Date(),
      result: 'Failed',
      activityModule: 'Members',
      reportType: null,
      entityId: null,
    };
    await this.activityRepository.save(loginFailedActivity);
  }

  @OnEvent('boostActivity')
  async boostActivity(data) {
    const { user,farmName } = await data.originalData;
    console.log('=============={ user,farmName }',{ user,farmName })
    let routeLink = `${this.baseUrl}/farms/data/${
      farmName
    }/filter`;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.CREATE,
    );
    let boostActivity = {
      activityTypeId: activityType?.id,
      farmId: data.originalData.body.farmId,
      additionalInfo: `<a href="${routeLink}" class="systemTooltip">${await this.commonUtilsService.toTitleCase(
        farmName,
      )}</a> is now boosting their stallions.`,
      ipAddress: clientIp,
      userAgent: data.originalData.headers['user-agent'],
      userName: user ? user.fullName : null,
      userEmail: user ? user.email : null,
      userCountryId: user ? user.countryId : null,
      createdBy: user?.id,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'Messages',
      reportType: null,
      entityId: null,
    };
    console.log('==============boostActivity',boostActivity)

    await this.activityRepository.save(boostActivity);
  }

  @OnEvent('completedTheContactForm')
  async completedTheContactFormActivity(data) {
    const { body } = data.originalData;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.READ,
    );
    let completedTheContactFormActivity = {
      activityTypeId: activityType?.id,
      additionalInfo: `${body.contactName} completed the Contact form`,
      ipAddress: clientIp,
      userAgent: data.originalData.headers['user-agent'],
      userName: body.contactName ? body.contactName : null,
      userEmail: null,
      userCountryId: null,
      createdBy: null,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'General',
      reportType: null,
      entityId: null,
    };
    await this.activityRepository.save(completedTheContactFormActivity);
  }

  /*Get a Activity with activityCode */
  async getActivityTypeByActivityTypeCode(activityTypeCode: string) {
    const queryBuilder = getRepository(ActivityType)
      .createQueryBuilder('activityType')
      .select(
        'activityType.id, activityType.activityName, activityType.activityTypeCode',
      )
      .andWhere('activityType.activityTypeCode = :activityTypeCode', {
        activityTypeCode: activityTypeCode,
      });

    const record = await queryBuilder.getRawOne();
    return record;
  }
}
