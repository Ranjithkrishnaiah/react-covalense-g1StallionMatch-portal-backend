import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class SmpActivityTrackerService {
  subscribeData: any;
  farmActivityHookData: any;
  stallionActivityPromotion: any;
  updateMemberEvent: any;
  farmUpdateActivityData: any;
  updateAccessLevelId: any;
  deleteInvitationId:any;

  constructor(
    private eventEmitter: EventEmitter2,
    readonly configService: ConfigService,
  ) {}

  async updateMemberLastActive(memberId: number) {
    await this.eventEmitter.emitAsync('updateLastActive', memberId);
  }

  @OnEvent('updateActivityFarm')
  async listenToStallionTestimonialAddandUpdate(data: any) {
    this.subscribeData = await data;
  }

  @OnEvent('farmUpdateActivity')
  async listToFarmUpdateActivity(data: any) {
    this.farmUpdateActivityData = await data;
  }

  @OnEvent('updateInviteMemberToFarm')
  async listToFarmInvitationActivity(data: any) {
    this.farmActivityHookData = await data;
  }

  @OnEvent('updateStallionStopPromotion')
  async listToUpdateStallionPromotion(data: any) {
    this.stallionActivityPromotion = await data;
  }

  @OnEvent('updatedMember')
  async updatedMember(data: any) {
    this.updateMemberEvent = await data;
  }

  @OnEvent('newAcessLevelId')
  async newAccessLevelId(data: any) {
    this.updateAccessLevelId = await data;
  }

  @OnEvent('changeAcessLevelId')
  async changeAccessLevelId(data: any) {
    this.updateAccessLevelId = await data;
  }

  @OnEvent('deleteInvitationId')
  async deleteAccessLevelId(data: any) {
    this.deleteInvitationId = await data;
  }

  async getAction(data) {

    const { request } = data;
    const { params, body, query, originalUrl } = request;
    let baseUrl = this.configService.get('file.activityBaseUrl');

    if (
      originalUrl ==
      baseUrl + `mares-list/download/${params?.id}?farmId=${query.farmId}`
    ) {
      await this.eventEmitter.emitAsync('downloadMareList', {
        originalData: request,
        subscribedData: await this.farmActivityHookData,
      });
    }
    let url = originalUrl;
    if (url.includes(`stallionName=${query.stallionName}`)) {
      await this.eventEmitter.emitAsync('searchStallionDirectory', {
        originalData: request,
      });
    } else if (
      url ==
      baseUrl + `stallions/search-mare-names?${query.mareName}=Favio`
    ) {
    } else if (
      `${baseUrl}farms?farmName=${query.farmName}&sortBy=${query.sortBy}&country=${query?.country}&YearToStud=${query.YearToStud}&currency=${query.currency}&colour=${query.colour}&priceRange=${query.priceRange}&isPrivateFee=${query.isPrivateFee}&isExcludeKeyAncestor=${query.isExcludeKeyAncestor}&location=${query.location}&limit=${query.limit}&page=${query.page}`
    ) {
      await this.eventEmitter.emitAsync('farmDirectorySearch', {
        originalData: request,
      });
    }
    if (originalUrl == baseUrl + 'member-paytype-access') {
      await this.eventEmitter.emitAsync('paymentDefault', {
        originalData: request,
      });
    }
    if (
      originalUrl ==
      baseUrl + `order-transactions/latest-order/${params.transactionId}`
    ) {
      await this.eventEmitter.emitAsync('transactionOrderId', {
        originalData: request,
      });
    }
    if (
      originalUrl ==
        baseUrl +
          `stallions/hypo-mating/${params.stallionId}/${params.mareId}/6?countryName=${query.countryName}` ||
      originalUrl ==
        baseUrl +
          `stallions/auth/hypo-mating/${params.stallionId}/${params.mareId}/6?countryName=${query.countryName}`
    ) {
      await this.eventEmitter.emitAsync('smSearchStallionMare', {
        originalData: request,
      });
    }
    if (
      originalUrl ==
      baseUrl +
        `stallions/${params.stallionId}/stallion-info?isCache=${query.isCache}`
    ) {
      await this.eventEmitter.emitAsync('stallionViewReport', {
        originalData: request,
      });
    }
    if (
      originalUrl ==
      baseUrl + `farms/${params.farmId}?countryName=${query.countryName}`
    ) {
      await this.eventEmitter.emitAsync('userViewedFarm', {
        originalData: request,
      });
    }
  }

  async postAction(data) {
    let baseUrl = this.configService.get('file.activityBaseUrl');
    const { request } = data;
    const { params, body, originalUrl } = request;

    if (originalUrl == baseUrl + `mares-list/${params?.farmId}`) {
      await this.eventEmitter.emitAsync('addingMareList', {
        originalData: request,
        subscribedData: this.farmActivityHookData,
      });
    } else if (
      originalUrl ==
      baseUrl + `farms/${params.farmId}/profile-image`
    ) {
      await this.eventEmitter.emitAsync('uploadProfileImage', {
        originalData: request,
        subscribedData: this.farmActivityHookData,
      });
    } else if (
      originalUrl ==
      baseUrl + `farms/${params.farmId}/gallery-images`
    ) {
      await this.eventEmitter.emitAsync('uploadFarmImageGallery', {
        originalData: request,
        subscribedData: this.farmActivityHookData,
      });
    } else if (originalUrl == baseUrl + `member-invitations`) {
      await this.eventEmitter.emitAsync('memberInvitationFarm', {
        originalData: request,
        subscribedData: this.farmActivityHookData,
      });
    } else if (originalUrl == baseUrl + `stallions`) {
      await this.eventEmitter.emitAsync('addingStallionToFarm', {
        originalData: request,
      });
    } else if (originalUrl == baseUrl + 'stallion-promotions') {
      await this.eventEmitter.emitAsync('stallionPromotions', {
        originalData: request,
        subscribedData: this.farmActivityHookData,
      });
    } else if (originalUrl == baseUrl + 'stallion-nominations') {
      await this.eventEmitter.emitAsync('stallionNominations', {
        originalData: request,
      });
    } else if (
      originalUrl ==
      baseUrl +
        `stallions/submit-remove-reason/${params?.stallionId}/${params?.reasonId}`
    ) {
      await this.eventEmitter.emitAsync('removeStallionWithReason', {
        originalData: request,
      });
    } else if (originalUrl == baseUrl + `stallion-shortlist`) {
      await this.eventEmitter.emitAsync('stallionShortlist', {
        originalData: request,
      });
    } else if (originalUrl == baseUrl + `auth/email/register/farm-owner`) {
      await this.eventEmitter.emitAsync('userRegistration', {
        originalData: request,
      });
    } else if (originalUrl == baseUrl + `message`) {
      await this.eventEmitter.emitAsync('sendingMessageToFarm', {
        originalData: request,
      });
    } else if (originalUrl == baseUrl + 'farms') {
      await this.eventEmitter.emitAsync('createNewFarm', {
        originalData: request,
      });
    } else if (originalUrl == baseUrl + `member-mares`) {
      await this.eventEmitter.emitAsync('addMareToList', {
        originalData: request,
      });
    } else if (originalUrl == baseUrl + `member-invitations/resend`) {
      await this.eventEmitter.emitAsync('resendInvitation', {
        originalData: request,
      });
    } else if (originalUrl == baseUrl + `member-paytype-access/customer`) {
      await this.eventEmitter.emitAsync('memberPaymenttype', {
        originalData: request,
      });
    } else if (originalUrl == baseUrl + 'auth/email/login') {
      await this.eventEmitter.emitAsync('loginSuccessful', {
        originalData: request,
      });
    } else if (originalUrl == baseUrl + 'auth/forgot/password') {
      await this.eventEmitter.emitAsync('resendEmailInvite', {
        originalData: request,
      });
    } else if (originalUrl == baseUrl + 'register-interest/insights-report') {
      await this.eventEmitter.emitAsync('emailInsigtsReport', {
        originalData: request,
      });
    } else if (originalUrl == baseUrl + 'contactus') {
      await this.eventEmitter.emitAsync('contactUs', { originalData: request });
    } else if (originalUrl == baseUrl + 'favourite-broodmare-sires') {
      await this.eventEmitter.emitAsync('favouriteBroodmareSires', {
        originalData: request,
      });
    } else if (originalUrl == baseUrl + 'nomination-request') {
      await this.eventEmitter.emitAsync('nominationRequest', {
        originalData: request,
      });
    } else if (originalUrl == baseUrl + 'favourite-farms') {
      await this.eventEmitter.emitAsync('faviourateFarm', {
        originalData: request,
      });
    } else if (originalUrl == baseUrl + 'favourite-stallions') {
      await this.eventEmitter.emitAsync('favStallions', {
        originalData: request,
      });
    } else if (
      originalUrl ==
        baseUrl + `stallions/stallion-page-view-auth/${params.stallionId}` ||
      originalUrl ==
        baseUrl + `stallions/stallion-page-view/${params.stallionId}`
    ) {
      await this.eventEmitter.emitAsync('userViewedStallion', {
        originalData: request,
      });
    }
  }

  async updateAction(data) {
    let baseUrl = this.configService.get('file.activityBaseUrl');
    const { request } = data;
    const { params, body, originalUrl } = request;

    if (originalUrl == baseUrl + `stallions/${params.stallionId}/overview`) {
      await this.eventEmitter.emitAsync('updateOverView', {
        originalData: request,
        subscribedData: this.subscribeData,
      });
    } else if (originalUrl == baseUrl + 'nomination-request') {
      await this.eventEmitter.emitAsync('acceptOrRejectNominationRequest', {
        originalData: request,
        subscribedData: this.farmActivityHookData,
      });
    } else if (
      originalUrl ==
      baseUrl + `stallions/${params.stallionId}/profile`
    ) {
      await this.eventEmitter.emitAsync('stallionProfileImage', {
        originalData: request,
        subscribedData: this.subscribeData,
      });
    } else if (
      originalUrl ==
      baseUrl + `stallions/${params.stallionId}/testimonials`
    ) {
      await this.eventEmitter.emitAsync('addUpdateTestimonials', {
        originalData: request,
        subscribedData: this.subscribeData,
      });
    } else if (originalUrl == baseUrl + `farms/${params.farmId}/profile`) {
      await this.eventEmitter.emitAsync('updateProfile', {
        originalData: request,
        subscribedData: this.farmUpdateActivityData,
      });
    } else if (originalUrl == baseUrl + `farms/${params.farmId}/overview`) {
      await this.eventEmitter.emitAsync('uploadFarmOverview', {
        originalData: request,
        subscribedData: this.farmActivityHookData,
      });
    } else if (originalUrl == baseUrl + `farms/${params.farmId}/medias`) {
      await this.eventEmitter.emitAsync('updatemedias', {
        originalData: request,
        subscribedData: this.farmActivityHookData,
      });
    } else if (originalUrl == baseUrl + `member-invitations`) {
      await this.eventEmitter.emitAsync('memberInvitationFarm', {
        originalData: request,
        subscribedData: this.farmActivityHookData,
      });
    } else if (originalUrl == baseUrl + `mares-list/${params?.id}`) {
      await this.eventEmitter.emitAsync('updateMareList', {
        originalData: request,
        subscribedData: this.farmActivityHookData,
      });
    } else if (originalUrl == baseUrl + `auth/me/profile-image`) {
      await this.eventEmitter.emitAsync('updateUserProfileImage', {
        originalData: request,
      });
    } else if (originalUrl == baseUrl + `auth/me/update-password`) {
      await this.eventEmitter.emitAsync('passwordChange', {
        originalData: request,
      });
    } else if (originalUrl == baseUrl + `stallion-promotions/stop-promotion-manually`) {
      await this.eventEmitter.emitAsync('stallionStopPromotion', {
        originalData: request,
        subscribedData: await this.stallionActivityPromotion,
      });
    } else if (
      originalUrl ==
      baseUrl + `stallions/${params.stallionId}/gallery-images`
    ) {
      await this.eventEmitter.emitAsync('updateStallionGalleryImages', {
        originalData: request,
      });
    } else if (
      originalUrl == baseUrl + `auth/me/fullName` ||
      originalUrl == baseUrl + `auth/me/email`
    ) {
      await this.eventEmitter.emitAsync('updateMemberDetail', {
        originalData: request,
        subscribedData: await this.updateMemberEvent,
      });
    // } else if (originalUrl == baseUrl + `auth/me/update-address`) {
    //   await this.eventEmitter.emitAsync('updateUserAddress', {
    //     originalData: request,
    //   });
    } else if (originalUrl == baseUrl + `member-paytype-access`) {
      await this.eventEmitter.emitAsync('updatePaymentType', {
        originalData: request,
      });
    } else if (originalUrl == baseUrl + `member-invitations/`) {
      await this.eventEmitter.emitAsync('changeAccessLevel', {
        originalData: request,
        subscribedData: await this.updateAccessLevelId,
      });
    }
  }

  async deleteAction(data) {
    let baseUrl = this.configService.get('file.activityBaseUrl');
    const { request } = data;
    const { params, body, query, originalUrl } = request;

    if (originalUrl == baseUrl + 'message') {
      await this.eventEmitter.emitAsync('deleteConversation', {
        originalData: request,
        subscribedData: this.farmActivityHookData,
      });
    } else if (originalUrl == baseUrl + 'farms/' + params?.id) {
      await this.eventEmitter.emitAsync('deleteFarmActivity', {
        originalData: request,
      });
    } else if (originalUrl == baseUrl + 'mares-list/' + params?.id) {
      await this.eventEmitter.emitAsync('deleteMareListName', {
        originalData: request,
        subscribedData: this.farmActivityHookData,
      });
    } else if (originalUrl == baseUrl + 'stallions') {
      await this.eventEmitter.emitAsync('deleteStallion', {
        originalData: request,
      });
    } else if (
      originalUrl ==
      baseUrl + `stallion-shortlist/${params.stallionId}`
    ) {
      await this.eventEmitter.emitAsync('removeShortList', {
        originalData: request,
      });
    } else if (originalUrl == baseUrl + `farms`) {
      await this.eventEmitter.emitAsync('deleteFarm', {
        originalData: request,
      });
    } else if (originalUrl == baseUrl + `member-mares`) {
      await this.eventEmitter.emitAsync('deleteMemberMares', {
        originalData: request,
      });
    } else if (originalUrl == baseUrl + `member-paytype-access`) {
      await this.eventEmitter.emitAsync('deleteMemberPaymentType', {
        originalData: request,
      });
    } else if (originalUrl == baseUrl + `favourite-broodmare-sires`) {
      await this.eventEmitter.emitAsync('favouriteBroodmareSiresDelete', {
        originalData: request,
      });
    } else if (originalUrl == baseUrl + `member-invitations`) {
      await this.eventEmitter.emitAsync('deleteMemberInvitation', {
        originalData: request,
        subscribedData: this.deleteInvitationId,
      });
    } else if (originalUrl == baseUrl + 'favourite-stallions') {
      await this.eventEmitter.emitAsync('deleteFavStallions', {
        originalData: request,
      });
    } else if (originalUrl == baseUrl + 'favourite-farms') {
      await this.eventEmitter.emitAsync('deleteFavFarm', {
        originalData: request,
      });
    }
  }
}
