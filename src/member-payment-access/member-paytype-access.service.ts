import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Scope,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { MembersService } from 'src/members/members.service';
import Stripe from 'stripe';
import { Repository } from 'typeorm';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { CreateMemberPaymentTypeAccessDto } from './dto/create-memberpaytype-access.dto';
import { MemberPaytypeAccess } from './entities/member-paytype-access.entity';
import { PAYMENT_METHOD, PAYMENT_METHOD_TEXT } from 'src/utils/constants/common';

@Injectable({ scope: Scope.REQUEST })
export class MemberPaymentAccessService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(MemberPaytypeAccess)
    private memberPaytypeAccessRepository: Repository<MemberPaytypeAccess>,
    private membersService: MembersService,
    private configService: ConfigService,
  ) {}

  async create(
    createMemberPaymentTypeAccessDto: CreateMemberPaymentTypeAccessDto,
  ) {
    const stripe = new Stripe(
      `${this.configService.get('app.stripeSecretKey')}`,
      {
        apiVersion: null,
      },
    );
    const { email, cardNumber, expMonth, expYear, cvc } =
      createMemberPaymentTypeAccessDto;
    const customer = await stripe.customers.create({
      email: email,
    });

    /*const token = await stripe.tokens.create({
      card: {
        number: cardNumber,
        exp_month: expMonth,
        exp_year: expYear,
        cvc: cvc,
      },
    });

    const cardInfo = await stripe.customers.createSource(customer.id, {
      source: token.id,
    });*/

    return customer;
  }

  //to create new customer in stripe.if alread record in db updating otherwise creating payment access
  async createCustomer(createCustomerDto: CreateCustomerDto) {
    const { paymentMethod, email } = createCustomerDto;
    const member = await this.membersService.findOne({ email: email });
    const stripe = new Stripe(
      `${this.configService.get('app.stripeSecretKey')}`,
      {
        apiVersion: null,
      },
    );
    const customer = await stripe.customers.create({
      email: member['email'],
    });
    const setupIntent = await stripe.setupIntents.create({
      customer: customer.id,
    });
    let memberPaytypeAccessRecord = {
      paymentMethodId: paymentMethod,
      customerId: customer.id,
      clientSecret: setupIntent.client_secret,
      createdBy: member['id'],
      isActive: true,
      isDefault: false,
    };
    const paymentAccessRes = await this.findByEntity({
      createdBy: member['id'],
    });
    if (paymentAccessRes.length == 0) {
      memberPaytypeAccessRecord.isDefault = true;
    } else {
      await this.memberPaytypeAccessRepository.update(
        { createdBy: member['id'], paymentMethodId: paymentMethod },
        { isActive: false, isDefault: false },
      );
    }
    console.log('====memberPaytypeAccessRecord', memberPaytypeAccessRecord);
    const result = await this.memberPaytypeAccessRepository.save(
      this.memberPaytypeAccessRepository.create(memberPaytypeAccessRecord),
    );
    return result;
  }

  //making selected payment type as active based on member id and paymentMethod id
  async updateDetails(createCustomerDto: CreateCustomerDto) {
    const { paymentMethod, email } = createCustomerDto;
    const member = await this.membersService.findOne({ email: email });
    if (!member) {
      throw new HttpException(
        'User with this id does not exist',
        HttpStatus.NOT_FOUND,
      );
    }
    const paymentAccessRes = await this.findByEntity({
      createdBy: member['id'],
      paymentMethodId: paymentMethod,
    });

    await this.memberPaytypeAccessRepository.update(
      { createdBy: member['id'] },
      { isDefault: false },
    );
    await this.memberPaytypeAccessRepository.update(
      { id: paymentAccessRes[0].id },
      { isActive: true, isDefault: true },
    );
    return { message: 'The record has been successfully Updated.' };
  }

  //getting customer details and card details
  async getCustomerDetails(paymentMethodId, memberUuid) {
    const member = await this.membersService.findOne({
      memberuuid: memberUuid,
    });
    const result = await this.memberPaytypeAccessRepository.find({
      where: {
        paymentMethodId: paymentMethodId,
        createdBy: member.id,
        isActive: true,
      },
    });

    if (
      result.length > 0 &&
      result[0].paymentMethodId == PAYMENT_METHOD.CARD &&
      !result[0].paymentMethod
    ) {
      const stripe = new Stripe(
        `${this.configService.get('app.stripeSecretKey')}`,
        {
          apiVersion: null,
        },
      );
      let paymentMethods = await stripe.paymentMethods.list({
        customer: result[0].customerId,
        type: 'card',
      });
      await this.memberPaytypeAccessRepository.update(
        {
          createdBy: member.id,
          paymentMethodId: paymentMethodId,
          customerId: result[0].customerId,
        },
        { paymentMethod: paymentMethods.data[0].id },
      );
    }
    const response = await this.memberPaytypeAccessRepository.find({
      where: {
        paymentMethodId: paymentMethodId,
        createdBy: member.id,
        isActive: true,
      },
    });

    return response;
  }

  //getting customer card details only
  async getDetails(fields) {
    const result = await this.memberPaytypeAccessRepository.find({
      where: fields,
    });
    if (
      result.length > 0 &&
      result[0].paymentMethodId == PAYMENT_METHOD.CARD &&
      !result[0].paymentMethod
    ) {
      const stripe = new Stripe(
        `${this.configService.get('app.stripeSecretKey')}`,
        {
          apiVersion: null,
        },
      );
      const paymentMethods = await stripe.paymentMethods.list({
        customer: result[0].customerId,
        type: 'card',
      });
      if (paymentMethods && paymentMethods.data.length > 0) {
        await this.memberPaytypeAccessRepository.update(
          {
            createdBy: fields.createdBy,
            paymentMethodId: PAYMENT_METHOD.CARD,
            customerId: result[0].customerId,
          },
          { paymentMethod: paymentMethods.data[0].id },
        );
      }
    }
    return result;
  }

  //redirecting to the stripe card details form to save new card detals
  async renderCard(memberUuid, res) {
    const member = await this.membersService.findOne({
      memberuuid: memberUuid,
    });
    const result = await this.memberPaytypeAccessRepository.find({
      where: { paymentMethodId: PAYMENT_METHOD.CARD, createdBy: member.id, isActive: true },
    });
    if (
      result.length > 0 &&
      result[0].paymentMethodId == PAYMENT_METHOD.CARD &&
      result[0].clientSecret
    ) {
      return res.render('index', {
        secretKey: result[0].clientSecret,
        clientUrl: process.env.FRONTEND_DOMAIN,
      });
    }
  }

  //redirecting to the stripe card details form to update card detals
  async updateCard(memberUuid, res) {
    const member = await this.membersService.findOne({
      memberuuid: memberUuid,
    });
    await this.memberPaytypeAccessRepository.delete({
      createdBy: member.id,
      paymentMethodId: PAYMENT_METHOD.CARD,
    });
    await this.createCustomer({
      email: member.email,
      paymentMethod: 1,
    });
    const result = await this.memberPaytypeAccessRepository.find({
      where: { paymentMethodId: PAYMENT_METHOD.CARD, createdBy: member.id, isActive: true },
    });
    if (!(result.length > 0)) {
      throw new HttpException(
        'User with this id does not exist',
        HttpStatus.NOT_FOUND,
      );
    }
    // const stripe = new Stripe(`${this.configService.get('app.stripeSecretKey')}`, {
    //   apiVersion: null
    // });
    // const setupIntent = await stripe.setupIntents.create({
    //   customer: result[0].customerId,
    // });

    if (
      result.length > 0 &&
      result[0].paymentMethodId == PAYMENT_METHOD.CARD &&
      result[0].clientSecret
    ) {
      // await this.memberPaytypeAccessRepository.update(
      //   { id: result[0].id },
      //   { paymentMethod: null, clientSecret: setupIntent.client_secret },
      // );

      return res.render('index', {
        secretKey: result[0].clientSecret,
        clientUrl: process.env.FRONTEND_DOMAIN,
      });
    }
  }

  //getting all active payment methods added by member
  async findAll() {
    const member = this.request.user;
    //Delete Null Data
    // await this.memberPaytypeAccessRepository.delete({
    //   createdBy: member['id'],
    //   paymentMethodId: 1,
    //   paymentmethod: IsNull()
    // });
    const queryBuilder = this.memberPaytypeAccessRepository
      .createQueryBuilder('memberPaytypeAccess')
      .select(
        'memberPaytypeAccess.isDefault as isDefault, memberPaytypeAccess.customerId as customerId',
      )
      .addSelect('paymentmethod.paymentMethod as paymentMethod')
      .leftJoin('memberPaytypeAccess.paymentmethod', 'paymentmethod')
      .andWhere('memberPaytypeAccess.createdBy=:memberId', {
        memberId: member['id'],
      })
      .andWhere('memberPaytypeAccess.isActive = 1');

    const entities = await queryBuilder.getRawMany();

    const result = await Promise.all(
      entities.map(async (Obj) => {
        const stripe = new Stripe(
          `${this.configService.get('app.stripeSecretKey')}`,
          {
            apiVersion: null,
          },
        );
        if (Obj.paymentMethod == PAYMENT_METHOD_TEXT.CARD && Obj.customerId) {
          try {
            let pamentMethodsRes = await stripe.paymentMethods.list({
              customer: Obj.customerId,
              type: PAYMENT_METHOD_TEXT.CARD,
            });
            if (pamentMethodsRes && pamentMethodsRes.data.length > 0) {
              await this.memberPaytypeAccessRepository.update(
                {
                  createdBy: member['id'],
                  paymentMethodId: PAYMENT_METHOD.CARD,
                  customerId: Obj.customerId,
                },
                { paymentMethod: pamentMethodsRes.data[0].id },
              );
              Obj.cardDetails = pamentMethodsRes.data[0].card;
              Obj.billingDetails = pamentMethodsRes.data[0].billing_details;
            }
            return Obj;
          } catch (error) {
            console.log(error);
            return Obj;
          }
        } else {
          return Obj;
        }
      }),
    );

    return result;
  }

  //to get customer details from stripe using customerId
  async retrieveCustomer(customerId: string) {
    const stripe = new Stripe(
      `${this.configService.get('app.stripeSecretKey')}`,
      {
        apiVersion: null,
      },
    );
    return await stripe.customers.retrieve(customerId);
  }

  //getting payment methods based on entities
  async findByEntity(entity) {
    return await this.memberPaytypeAccessRepository.find({
      where: entity,
      order: { id: 'DESC' },
    });
  }

  //to delete payment methods added by member in database table
  async deleteCustomer(createCustomerDto: CreateCustomerDto) {
    const { paymentMethod, email } = createCustomerDto;
    const member = await this.membersService.findOne({ email: email });
    if (!member) {
      throw new HttpException(
        'User with this id does not exist',
        HttpStatus.NOT_FOUND,
      );
    }
    const paymentAccessRes = await this.findByEntity({
      createdBy: member['id'],
      paymentMethodId: paymentMethod,
    });
    if (!(paymentAccessRes.length > 0)) {
      throw new HttpException(
        'No results found with this payment method for this user',
        HttpStatus.NOT_FOUND,
      );
    }
    await this.memberPaytypeAccessRepository.delete({
      createdBy: member['id'],
      paymentMethodId: paymentMethod,
    });
    return { message: 'The record has been successfully deleted.' };
  }

  //getting payment method details stored in database table only
  async findCustomerDetails(fields) {
    return await this.memberPaytypeAccessRepository.findOne({
      where: fields,
      order: { id: 'DESC' },
    });
  }
}
