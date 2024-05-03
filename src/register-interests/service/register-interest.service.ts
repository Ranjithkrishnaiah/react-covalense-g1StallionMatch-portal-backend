import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  Inject,
  Scope,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { RegisterIntrestDto } from '../dto/register-intrest.dto';
import { RegisterIntrestFarmDto } from '../dto/register-intrest-farm.dto';
import { RegisterInterestRepository } from '../repository/register-interest.repository';
import { UnSubscribeDto } from '../dto/unsubsribe.dto';
import { ReSubscribeDto } from '../dto/resubsribe.dto';
import { SubscribeDto } from '../dto/subscribe.dto';
import { MailService } from 'src/mail/mail.service';

@Injectable({ scope: Scope.REQUEST })
export class RegisterInterestService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(RegisterInterestRepository)
    private riRepository: RegisterInterestRepository,
    private mailService: MailService,
  ) {}

  /* Register Intrest */
  async registerIntrest(
    registerIntrestDto: RegisterIntrestDto,
    type: number,
  ): Promise<{ message: string }> {
    const { email } = registerIntrestDto;
    await this.getRecordByEmailAndTypeId(email, type);
    const message = await this.riRepository.registerIntrest(
      this.request,
      registerIntrestDto,
      type,
    );
    const record = await this.riRepository.findOne({ email });
    this.mailService.registerYourInterest(record);
    return message;
  }

  /* Register Intrest On Farm */
  async registerIntrestFarm(
    registerIntrestFarmDto: RegisterIntrestFarmDto,
    type: number,
  ): Promise<{ message: string }> {
    const { email } = registerIntrestFarmDto;
    await this.getRecordByEmailAndTypeId(email, type);
    const message = await this.riRepository.registerIntrest(
      this.request,
      registerIntrestFarmDto,
      type,
    );
    const record = await this.riRepository.findOne({ email });
    this.mailService.registerYourInterestOnFarm(record);
    return message;
  }

  /* Insights Report */
  async insightsReport(
    subscribeDto: SubscribeDto,
    type: number,
  ): Promise<{ message: string }> {
    const { email } = subscribeDto;
    await this.getRecordByEmailAndTypeId(email, type);
    const message = await this.riRepository.subscribe(
      this.request,
      subscribeDto,
      type,
    );

    const record = await this.riRepository.findOne({
      email,
      registerInterestTypeId: type,
    });
    this.mailService.insightReportSubscription(record);

    return message;
  }

  /* Subscribe */
  async farm(
    subscribeDto: SubscribeDto,
    type: number,
  ): Promise<{ message: string }> {
    const { email } = subscribeDto;

    await this.getRecordByEmailAndTypeId(email, type);
    const message = await this.riRepository.subscribe(
      this.request,
      subscribeDto,
      type,
    );

    const record = await this.riRepository.findOne({
      email,
      registerInterestTypeId: type,
    });

    this.mailService.farmSubscription(record);
    return message;
  }

  /* Check Valid Email */
  async isEmailValid(
    email: string,
    type: number,
  ): Promise<{ message: string }> {
    await this.getRecordByEmailAndTypeId(email, type);
    return { message: 'Your email is valid!' };
  }

  /* Get Record By EmailAndTypeId */
  async getRecordByEmailAndTypeId(email: string, type: number) {
    const record = await this.riRepository.findOne({
      email,
      registerInterestTypeId: type,
    });
    if (record) {
      throw new ConflictException('Email already exists');
    }
  }

  /* Get SubscriberInfo By Id */
  async getSubscriberInfoById(registerInterestUuid: string) {
    const record = await this.riRepository.findOne({
      registerInterestUuid,
    });
    if (!record) {
      throw new ConflictException('Record not exists');
    }
    return record;
  }

  /* UnSubscribe */
  async unSubscribe(
    unSubscribeDto: UnSubscribeDto,
  ): Promise<{ message: string }> {
    const { unSubscribeKey } = unSubscribeDto;
    let subscriberId = unSubscribeKey;
    let record = await this.getSubscriberInfoById(subscriberId);
    if (!record.isSubscribed) {
      throw new UnauthorizedException('You have already unsubscribed!');
    }
    const message = await this.riRepository.unSubscribe(record);
    return message;
  }

  /* ReSubscribe */
  async reSubscribe(
    reSubscribeDto: ReSubscribeDto,
  ): Promise<{ message: string }> {
    const { reSubscribeKey } = reSubscribeDto;
    let subscriberId = reSubscribeKey;
    let record = await this.getSubscriberInfoById(subscriberId);
    if (record.isSubscribed) {
      throw new UnauthorizedException('You have already subscribed!');
    }
    const message = await this.riRepository.reSubscribe(record);
    return message;
  }

  /* Find one by registerInterestUuid */
  async find(registerInterestUuid: string) {
    const record = await this.riRepository.findOne({ registerInterestUuid });
    if (!record) {
      throw new ConflictException('Record not exists');
    }
    let fullName = 'User';
    if (record.fullName) {
      fullName = record.fullName;
    }
    return { fullName: fullName };
  }

  /* Find InsightReport user by registerInterestUuid */
  async findInsightReportUser(registerInterestUuid: string, type: number) {
    const record = await this.riRepository.findOne({
      registerInterestUuid,
      registerInterestTypeId: type,
    });
    if (!record) {
      throw new ConflictException('You are not eligible to get this report.');
    }
    return true;
  }
}
