import { Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { CurrenciesService } from 'src/currencies/currencies.service';
import { FarmsService } from 'src/farms/farms.service';
import { HorsesService } from 'src/horses/horses.service';
import { MediaService } from 'src/media/media.service';
import { MemberAddress } from 'src/member-address/entities/member-address.entity';
import { MembersService } from 'src/members/members.service';
import { MessageMediaService } from 'src/message-media/message-media.service';
import { MessageRecipient } from 'src/message-recepient/entities/message-recipient.entity';
import { CreateMessageUnregisteredDto } from 'src/messages/dto/create-message-unregistered.dto';
import { CreateMessageDto } from 'src/messages/dto/create-message.dto';
import { Message } from 'src/messages/entities/messages.entity';
import { MessageService } from 'src/messages/messages.service';
import { NomPricing } from 'src/nomination-pricing/entities/nomination-pricing.entity';
import { StallionServiceFee } from 'src/stallion-service-fees/entities/stallion-service-fee.entity';
import { StallionsService } from 'src/stallions/stallions.service';
import { DeleteResult, Repository, getRepository } from 'typeorm';
import { NominationRequestResponseDto } from './dto/nomination-request-response.dto';
import { NominationRequestDto } from './dto/nomination-request.dto';
import { SearchNominationRequestDto } from './dto/search-nomination-request.dto';
import { UpdateNominationRequestDto } from './dto/update-nomination-request.dto';
import { NominationRequest } from './entities/nomination-request.entity';
import { DEFAULT_VALUES } from 'src/utils/constants/common';

@Injectable({ scope: Scope.REQUEST })
export class NominationRequestService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(NominationRequest)
    private NominationRequestRepository: Repository<NominationRequest>,
    private stallionsService: StallionsService,
    private farmService: FarmsService,
    private horseService: HorsesService,
    private messageService: MessageService,
    private membersService: MembersService,
    private messageMediaService: MessageMediaService,
    private mediaService: MediaService,
    private currenciesService: CurrenciesService,
  ) {}

  /* Get All nomination requests */
  async findAll(
    searchOptionsDto: SearchNominationRequestDto,
  ): Promise<NominationRequestResponseDto[]> {
    const member = this.request.user;
    const queryBuilder = getRepository(NominationRequest)
      .createQueryBuilder('NominationRequest')
      .select(
        'NominationRequest.id as nominationId, NominationRequest.mareId as mareId, NominationRequest.offerPrice as offerPrice, NominationRequest.cob as cob, NominationRequest.yob as yob, NominationRequest.isAccepted as isAccepted, NominationRequest.createdBy as createdBy',
      )
      .addSelect(
        'stallion.id as stallionId, stallion.stallionUuid as stallionUuid, stallion.height as height, stallion.yeartoStud as yeartoStud',
      )
      .addSelect(
        'farm.id as farmId, farm.farmUuid as farmUuid, farm.farmName as farmName, farm.email as email, farm.overview as overview',
      )
      .innerJoin('NominationRequest.stallion', 'stallion')
      .innerJoin(
        'NominationRequest.farm',
        'farm',
        'farm.isVerified=1 AND farm.isActive=1',
      );

    if (searchOptionsDto.sortBy) {
      const sortBy = searchOptionsDto.sortBy;
      queryBuilder.orderBy(
        'NominationRequest.offerPrice',
        searchOptionsDto['order'],
      );
      if (sortBy.toLowerCase() === 'cob') {
        queryBuilder.orderBy(
          'NominationRequest.cob',
          searchOptionsDto['order'],
        );
      }
      if (sortBy.toLowerCase() === 'yob') {
        queryBuilder.orderBy(
          'NominationRequest.yob',
          searchOptionsDto['order'],
        );
      }
    }

    queryBuilder.offset(searchOptionsDto.skip).limit(searchOptionsDto.limit);

    const itemCount = await queryBuilder.getCount();
    const entities = await queryBuilder.getRawMany();

    return entities;
  }

  /* Get All nomination requests count */
  async getCount() {
    const member = this.request.user;
    return getRepository(NominationRequest)
      .createQueryBuilder('NominationRequest')
      .select('NominationRequest.id as id')
      .andWhere('NominationRequest.createdBy = :createdBy', {
        createdBy: member['id'],
      })
      .getCount();
  }

  /* Get One nomination request */
  async findOne(id: number): Promise<NominationRequestResponseDto> {
    const queryBuilder = getRepository(NominationRequest)
      .createQueryBuilder('NominationRequest')
      .select(
        'NominationRequest.id as nominationId, NominationRequest.mareId as mareId, NominationRequest.offerPrice as offerPrice, NominationRequest.cob as cob, NominationRequest.yob as yob, NominationRequest.isAccepted as isAccepted, NominationRequest.createdBy as createdBy',
      )
      .addSelect(
        'stallion.id as stallionId, stallion.stallionUuid as stallionUuid, stallion.height as height, stallion.yeartoStud as yeartoStud',
      )
      .addSelect(
        'farm.id as farmId, farm.farmUuid as farmUuid, farm.farmName as farmName, farm.email as email, farm.overview as overview',
      )
      .addSelect('horse.horseUuid as horseId, horse.horseName as horseName')
      .innerJoin('NominationRequest.stallion', 'stallion')
      .innerJoin('stallion.horse', 'horse')
      .innerJoin(
        'NominationRequest.farm',
        'farm',
        'farm.isVerified=1 AND farm.isActive=1',
      )
      .andWhere('NominationRequest.id=:id', { id });

    const entities = await queryBuilder.getRawOne();

    return entities;
  }

  /* Get One nomination request */
  async findByEntity(entity) {
    const record = await this.NominationRequestRepository.find({
      where: entity,
    });
    if (!record) {
      throw new NotFoundException('Record not exist!');
    }
    return record;
  }

  /* Delete nomination request */
  deleteNominationRequest(id: number) {
    return this.NominationRequestRepository.delete({ id });
  }

  /* Create nomination request */
  async create(createNominationRequestDto: NominationRequestDto) {
    const member = this.request.user;
    const stallion = await this.stallionsService.findOne(
      createNominationRequestDto.stallionId,
    );

    if (!stallion) {
      throw new NotFoundException('Stallion not exist!');
    }

    const farm = await this.farmService.getFarmByUuid(
      createNominationRequestDto.farmId,
    );

    if (!farm) {
      throw new NotFoundException('Farm not exist!');
    }

    let nominationRequestDto = new NominationRequest();
    nominationRequestDto.stallionId = stallion.id;
    nominationRequestDto.farmId = farm.id;
    if (createNominationRequestDto.mareId) {
      const mare = await this.horseService.findHorsesByUuid(
        createNominationRequestDto.mareId,
      );
      nominationRequestDto.mareId = mare.id;
      nominationRequestDto.mareName = mare.horseName;
    } else {
      nominationRequestDto.mareName = createNominationRequestDto.mareName;
    }
    nominationRequestDto.offerPrice = createNominationRequestDto.offerPrice;
    nominationRequestDto.currencyId = createNominationRequestDto.currencyId;
    nominationRequestDto.cob = createNominationRequestDto.cob;
    nominationRequestDto.yob = createNominationRequestDto.yob;
    nominationRequestDto.createdBy = member['id'];
    nominationRequestDto.modifiedOn = new Date();
    nominationRequestDto.createdOn = new Date();

    const response = await this.NominationRequestRepository.save(
      this.NominationRequestRepository.create(nominationRequestDto),
    );

    let createMessageDto = new CreateMessageDto();
    createMessageDto.stallionId = createNominationRequestDto.stallionId;
    createMessageDto.farmId = createNominationRequestDto.farmId;
    createMessageDto.message = createNominationRequestDto.message;
    createMessageDto.subject = createNominationRequestDto.subject;
    createMessageDto.fromMemberUuid = createNominationRequestDto.fromMemberId;
    createMessageDto.channelId = createNominationRequestDto.channelId;
    createMessageDto.nominationRequestId = response.id;

    const createMsgRes = await this.messageService.create(createMessageDto);

    return {
      nominationRequestId: response.nrUuid,
      message: 'Nomination Request created successfully.',
    };
  }

  /* Create nomination request - For Guest User */
  async createUnregistered(createNominationRequestDto: NominationRequestDto) {
    const stallion = await this.stallionsService.findOne(
      createNominationRequestDto.stallionId,
    );

    if (!stallion) {
      throw new NotFoundException('Stallion not exist!');
    }

    const farm = await this.farmService.getFarmByUuid(
      createNominationRequestDto.farmId,
    );

    if (!farm) {
      throw new NotFoundException('Farm not exist!');
    }

    let nominationRequestDto = new NominationRequest();
    nominationRequestDto.stallionId = stallion.id;
    nominationRequestDto.farmId = farm.id;
    if (createNominationRequestDto.mareId) {
      const mare = await this.horseService.findHorsesByUuid(
        createNominationRequestDto.mareId,
      );
      nominationRequestDto.mareId = mare.id;
      nominationRequestDto.mareName = mare.horseName;
    } else {
      nominationRequestDto.mareName = createNominationRequestDto.mareName;
    }
    nominationRequestDto.offerPrice = createNominationRequestDto.offerPrice;
    nominationRequestDto.currencyId = createNominationRequestDto.currencyId;
    nominationRequestDto.cob = createNominationRequestDto.cob;
    nominationRequestDto.yob = createNominationRequestDto.yob;
    nominationRequestDto.fullName = createNominationRequestDto.fullName;
    nominationRequestDto.email = createNominationRequestDto.email;
    nominationRequestDto.modifiedOn = new Date();
    nominationRequestDto.createdOn = new Date();

    const response = await this.NominationRequestRepository.save(
      this.NominationRequestRepository.create(nominationRequestDto),
    );
    let createMessageDto = new CreateMessageUnregisteredDto();
    createMessageDto.stallionId = createNominationRequestDto.stallionId;
    createMessageDto.farmId = createNominationRequestDto.farmId;
    createMessageDto.message = createNominationRequestDto.message;
    createMessageDto.subject = 'Nomination Enquiry Sent';
    createMessageDto.fromMemberId = createNominationRequestDto.fromMemberId;
    createMessageDto.channelId = createNominationRequestDto.channelId;
    createMessageDto.fullName = createNominationRequestDto.fullName;
    createMessageDto.email = createNominationRequestDto.email;
    createMessageDto.cob = createNominationRequestDto.cob;
    createMessageDto.yob = createNominationRequestDto.yob;

    createMessageDto.nominationRequestId = response.id;

    const createMsgRes = await this.messageService.createUnregistered(
      createMessageDto,
    );

    return 'Nomination Request created successfully.';
  }

  /* Update nomination request */
  async updateNominationRequest(
    updateNominationRequestDto: UpdateNominationRequestDto,
  ) {
    const member = this.request.user;
    const nominationRequest = await this.NominationRequestRepository.findOne(
      updateNominationRequestDto.requestId,
    );

    if (!nominationRequest) {
      throw new NotFoundException('Nomination Request not exist!');
    }

    const updateData = {
      isAccepted: updateNominationRequestDto.isAccepted,
      isDeclined: updateNominationRequestDto.isDeclined,
      offerPrice: nominationRequest.offerPrice,
      isCounterOffer: nominationRequest.isCounterOffer,
      counterOfferPrice: nominationRequest.counterOfferPrice,
      currencyId: nominationRequest.currencyId,
      stallionId: nominationRequest.stallionId,
      farmId: nominationRequest.farmId,
      mareId: nominationRequest.mareId,
      mareName: nominationRequest.mareName,
      cob: nominationRequest.cob,
      yob: nominationRequest.yob,
      createdBy: member['id'],
      createdOn: new Date(),
      modifiedOn: new Date(),
    };

    if (
      updateNominationRequestDto.isCounterOffer &&
      updateNominationRequestDto.counterOfferPrice
    ) {
      updateData.isCounterOffer = updateNominationRequestDto.isCounterOffer;
      updateData.counterOfferPrice =
        updateNominationRequestDto.counterOfferPrice;
    }

    if (
      nominationRequest.isCounterOffer &&
      nominationRequest.counterOfferPrice &&
      updateNominationRequestDto.isCounterOffer &&
      updateNominationRequestDto.counterOfferPrice
    ) {
      updateData.offerPrice = nominationRequest.counterOfferPrice;
      updateData.counterOfferPrice =
        updateNominationRequestDto.counterOfferPrice;
    }

    const response = await this.NominationRequestRepository.save(
      this.NominationRequestRepository.create(updateData),
    );
    let nomResponse = await this.NominationRequestRepository.findOne({
      id: response.id,
    });
    console.log("======response",response)

    
    let createMessageDto = new CreateMessageDto();
    let stallionRes = await this.stallionsService.findStallion({
      id: nominationRequest.stallionId,
    });
    let farmRes = await this.farmService.findOne({
      id: nominationRequest.farmId,
    });
    createMessageDto.stallionId = stallionRes.stallionUuid;
    createMessageDto.farmId = farmRes.farmUuid;
    createMessageDto.message = updateNominationRequestDto.message;
    createMessageDto.subject = updateNominationRequestDto.subject;
    createMessageDto.channelId = updateNominationRequestDto.channelId;
    createMessageDto.nominationRequestId = response.id;
    createMessageDto.fromMemberUuid = updateNominationRequestDto.fromMembeId;

    const createMsgRes = await this.messageService.create(createMessageDto);
    if (createMsgRes && updateNominationRequestDto.mediauuid) {
      if (createMsgRes?.result?.id) {
        let messageId = createMsgRes?.result?.id;
        let mediaRecord = await this.mediaService.create(
          updateNominationRequestDto.mediauuid,
        );
        await this.messageMediaService.create(messageId, mediaRecord.id);
      }
    }

    if (
      response &&
      (updateNominationRequestDto.isAccepted ||
        updateNominationRequestDto.isDeclined)
    ) {
      const memberRec = await this.membersService.findOne({
        memberuuid: updateNominationRequestDto.fromMembeId,
      });
      const NominationReqIds = await this.messageService.findRequestedIds({
        farmId: nominationRequest.farmId,
        stallionId: nominationRequest.stallionId,
        fromMemberId: memberRec.id,
      });
        NominationReqIds.forEach(async (obj) => {
          const result = await this.NominationRequestRepository.update(
            { id: obj.nominationRequestId },
            { isClosed: true },
          );
        });
      
    var  introFee
    if (updateNominationRequestDto.isAccepted == true) {
      const memberCurrency = await getRepository(MemberAddress).createQueryBuilder('mem')
        .select('country.preferredCurrencyId as currencyId')
        .innerJoin('mem.country', 'country')
        .andWhere('mem.memberId =:memberId', { memberId: member['id'] })
        .getRawOne()

      let studFeeSubQueryBuilder = await getRepository(StallionServiceFee)
        .createQueryBuilder('studFee')
        .select(
          'studFee.stallionId as stallionId, MAX(studFee.feeYear) as studFeeYear',
        )
        .andWhere('studFee.stallionId =:stallionId', { stallionId: nominationRequest.stallionId })
        .groupBy('studFee.stallionId');

      let studFeeQueryBuilder = await getRepository(StallionServiceFee)
        .createQueryBuilder('t1')
        .select('MAX(t1.id) studFeeId, t1.stallionId feeStallionId,t1.fee,t1.currencyId')
        .innerJoin(
          '(' + studFeeSubQueryBuilder.getQuery() + ')',
          't2',
          't2.stallionId=t1.stallionId and t1.feeYear=t2.studFeeYear',
        )
        .andWhere('t1.stallionId =:stallionId', { stallionId: nominationRequest.stallionId })
        .groupBy('t1.stallionId,t1.fee,t1.currencyId')
        .getRawOne()

      let fee

      if (memberCurrency.currencyId) {
        var pricingPresent = await this.checkPricing(memberCurrency.currencyId)
        if (pricingPresent) {
          console.log("=========pricingPresent========")
          if (studFeeQueryBuilder.currencyId != memberCurrency.currencyId) {
            let convertedFee = await this.convertToMemberCurrency(memberCurrency.currencyId, studFeeQueryBuilder.fee, studFeeQueryBuilder.currencyId)
            fee = convertedFee
          }
          else {
            fee = studFeeQueryBuilder.fee
          }
          introFee = await this.pricing(memberCurrency.currencyId, fee)

        }
        else {
          let defaultCurrency = DEFAULT_VALUES.CURRENCY;
          if (studFeeQueryBuilder.currencyId != defaultCurrency) {
            let convertedFee = await this.convertToMemberCurrency(defaultCurrency, studFeeQueryBuilder.fee, studFeeQueryBuilder.currencyId)
            fee = convertedFee
          }
          else {
            fee = studFeeQueryBuilder.fee
          }
          introFee = await this.pricing(defaultCurrency, fee)

        }
      }
    }
    }

    return {
      nominationRequestId: nominationRequest?.nrUuid,
      newRequestId : nomResponse.nrUuid,
      message: 'Nomination Request updated successfully.',
      introFee: introFee
    };
  }
  async convertToMemberCurrency(memCurrency, price, feeCurrency) {

    let toCurrency = await this.currenciesService.findCurrencyRateByCurrencyId(memCurrency)
    let fromCurrency = await this.currenciesService.findCurrencyRateByCurrencyId(feeCurrency)
    if (price) {
      let finalPrice = Math.round((price) * (toCurrency.rate / fromCurrency.rate)).toFixed(2)
      return finalPrice
    }

  }
  async checkPricing(currency) {
    let pricing = await getRepository(NomPricing).findOne({ currencyId: currency })
    return pricing
  }
  async pricing(currency, fee) {
    let finalFee;
    fee = parseInt(fee)
    let pricing = await this.checkPricing(currency)
    let pricingList = pricing?.studFeeRange.split(',');
    if (pricingList?.length === 2) {
      var min = pricingList[0];
      var max = pricingList[1];
    }
    if (fee < min) {
      finalFee = pricing.tier1
    }
    else if (fee >= min && fee <= max) {
      finalFee = pricing.tier2
    }
    else if (fee > max) {
      finalFee = pricing.tier3
    }
    return finalFee
  }
  async dynamicPricingTOS(currency) {
    let pricingPresent = await this.checkPricing(currency)
    if(pricingPresent){
      var currencyId :any = currency
    }
    else{
      var currencyId :any = 1
    }
    let pricing = await getRepository(NomPricing).createQueryBuilder('pricing')
    .select('pricing.tier1,pricing.tier2,pricing.tier3,pricing.studFeeRange')
    .addSelect('currency.currencySymbol as currencySymbol')
    .innerJoin('pricing.currency','currency')
    .andWhere('pricing.currencyId =:currencyId',{currencyId:currencyId})
    .getRawOne()
    console.log("pricing===========",pricing)
    let pricingList = pricing?.studFeeRange.split(',');
    if (pricingList.length === 2) {
      var min = pricingList[0];
      var max = pricingList[1];
    }
    const data ={
      min: min,
      max:max,
      tier1 :pricing.tier1,
      tier2 :pricing.tier2,
      tier3 :pricing.tier3,
      currencySymbol :pricing.currencySymbol
    }
 
    return data
  }
  async updateNominationRequestToRemoveCart( nominationId, nomination,){
    const record= await this.NominationRequestRepository.findOne({nrUuid:nominationId})
    const message= await getRepository(Message).findOne({nominationRequestId:record.id})
    const deleteResult :DeleteResult = await getRepository(MessageRecipient).delete({messageId:message.id})
    if(deleteResult.affected>0)
    {
      const mesaageDeleteResult :DeleteResult= await getRepository(Message).delete({nominationRequestId:record.id})
      if(mesaageDeleteResult.affected>0){
        const record= await this.NominationRequestRepository.delete({nrUuid:nominationId})
      }
        return {
        message: 'Nomination Request Removed successfully.'
      }
    }
    
 
  }

  async dynamicPricingForTooltip(currency,fee,feeCurrency) {
    let pricingPresent = await this.checkPricing(currency)
    if(pricingPresent){
      var currencyId :any = currency
    }
    else{
      var currencyId :any = 1
    }
    if(currency != feeCurrency){
      fee =this.convertToMemberCurrency(currency, fee, feeCurrency)
    }
    let pricing = await getRepository(NomPricing).createQueryBuilder('pricing')
    .select('pricing.tier1,pricing.tier2,pricing.tier3,pricing.studFeeRange')
    .addSelect('currency.currencySymbol as currencySymbol,currency.currencyCode as currencyCode')
    .innerJoin('pricing.currency','currency')
    .andWhere('pricing.currencyId =:currencyId',{currencyId:currencyId})
    .getRawOne()
    console.log("pricing===========",pricing)
    let pricingList = pricing?.studFeeRange.split(',');
    if (pricingList.length === 2) {
      var min = pricingList[0];
      var max = pricingList[1];
    }
    let feeToPay;

    if (fee < min) {
      feeToPay = pricing.tier1;
    } else if (fee >= min && fee < max) {
      feeToPay = pricing.tier2;
    } else if (fee >= max) {
      feeToPay = pricing.tier3; 
    }
    const data ={
      feeToPay :feeToPay,
      currencySymbol :pricing.currencySymbol,
      currencyCode : pricing.currencyCode
    }
 
    return data
  }


}
