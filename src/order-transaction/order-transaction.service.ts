import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  Scope,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { CartsService } from 'src/carts/carts.service';
import { Cart } from 'src/carts/entities/cart.entity';
import { CommonUtilsService } from 'src/common-utils/common-utils.service';
import { CurrenciesService } from 'src/currencies/currencies.service';
import { MailService } from 'src/mail/mail.service';
import { MemberPaytypeAccess } from 'src/member-payment-access/entities/member-paytype-access.entity';
import { MemberPaymentAccessService } from 'src/member-payment-access/member-paytype-access.service';
import { MembersService } from 'src/members/members.service';
import { MessageTemplate } from 'src/message-templates/entities/message-template.entity';
import { MessageTemplatesService } from 'src/message-templates/message-templates.service';
import { NotificationType } from 'src/notification-types/entities/notification-type.entity';
import { NotificationsService } from 'src/notifications/notifications.service';
import { OrderProductItem } from 'src/order-product-items/entities/order-product-item.entity';
import { OrderProduct } from 'src/order-product/entities/order-product.entity';
import { OrderStatusService } from 'src/order-status/order-status.service';
import { CreateOrderDto } from 'src/orders/dto/create-order.dto';
import { Order } from 'src/orders/entities/order.entity';
import { OrdersService } from 'src/orders/orders.service';
import { PaymentMethodsService } from 'src/payment-methods/payment-methods.service';
import { PreferedNotificationService } from 'src/prefered-notifications/prefered-notifications.service';
import { ProductsService } from 'src/products/products.service';
import { PromoCode } from 'src/promo-codes/entities/promo-code.entity';
import { PromoCodeService } from 'src/promo-codes/promo-codes.service';
import { StallionNomination } from 'src/stallion-nominations/entities/stallion-nomination.entity';
import { StallionPromotion } from 'src/stallion-promotions/entities/stallion-promotion.entity';
import { StallionPromotionService } from 'src/stallion-promotions/stallion-promotions.service';
import { Stallion } from 'src/stallions/entities/stallion.entity';
import { DEFAULT_VALUES, PAYMENT_METHOD, PAYMENT_METHOD_TEXT, PAYMENT_STATUS, PRODUCT } from 'src/utils/constants/common';
import {
  notificationTemplates,
  notificationType,
} from 'src/utils/constants/notifications';
import { ordersStatusList } from 'src/utils/constants/orders-status';
import {
  PRODUCTCODES,
  PRODUCTCODESLIST,
  PRODUCTLIST,
} from 'src/utils/constants/products';
import { PageMetaDto } from 'src/utils/dtos/page-meta.dto';
import { PageOptionsDto } from 'src/utils/dtos/page-options.dto';
import { PageDto } from 'src/utils/dtos/page.dto';
import Stripe from 'stripe';
import { Repository, getRepository } from 'typeorm';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { EstimateTaxDto } from './dto/estimate-tax.dto';
import { PaypalSuccessDto } from './dto/paypal-success.dto';
import { OrderTransaction } from './entities/order-transaction.entity';

const paypal = require('paypal-rest-sdk');

//this.configService.get('app.stripeSecretKey')
// paypal.configure({
//   'mode': 'sandbox', //sandbox or live
//   'client_id': 'AfB_LohIB2ESN-F31ahriGfmRuGP7NqsBlTwK1xg81zVk_s7kStNEkA84MhYvg58VvgJFFYzr8c6dD-R',
//   'client_secret': 'EJ4NvygGl0vl_piX56wwogQMZOpDg8q1n19qm-EyEHNiuEnPLLbexOMzI6N_b4vbq8PxIANmgPK5kc_S'
// });

@Injectable({ scope: Scope.REQUEST })
export class OrderTransactionService {
  private readonly stripe: Stripe;

  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(OrderTransaction)
    private orderTransactionRepository: Repository<OrderTransaction>,
    private ordersService: OrdersService,
    private productsService: ProductsService,
    private paymentMethodsService: PaymentMethodsService,
    private currenciesService: CurrenciesService,
    private memberPaymentAccessService: MemberPaymentAccessService,
    private membersService: MembersService,
    private mailService: MailService,
    private notificationsService: NotificationsService,
    private preferedNotificationService: PreferedNotificationService,
    private messageTemplatesService: MessageTemplatesService,
    private cartsService: CartsService,
    private commonUtilsService: CommonUtilsService,
    private readonly configService: ConfigService,
    readonly orderStatusService: OrderStatusService,
    readonly stallionPromotionService: StallionPromotionService,
    private promoCodeService: PromoCodeService,
  ) {
    this.stripe = new Stripe(
      `${this.configService.get('app.stripeSecretKey')}`,
      {
        apiVersion: null,
      },
    );
    paypal.configure({
      mode: 'sandbox', //sandbox or live
      client_id: this.configService.get('app.paypalClientIdKey'),
      client_secret: this.configService.get('app.paypalClientSecretKey'),
    });
  }

  async create(createTransactionDto: CreateTransactionDto) {
    try {
      const member = this.request.user;
      const { orderId } = createTransactionDto;
      let orderRecord = await this.ordersService.findOne({
        sessionId: orderId,
      });
      if (!orderRecord) {
        throw new NotFoundException('Not exist!');
      }

      createTransactionDto.orderId = orderRecord[0].id;
      const record = await this.orderTransactionRepository.save(
        this.orderTransactionRepository.create(createTransactionDto),
      );
      return record;
    } catch (err) {
      throw new UnprocessableEntityException(err);
    }
  }

  async createPaymentIntent(createPaymentIntentDto: CreatePaymentIntentDto) {
    const {
      emailId,
      currency,
      total,
      items,
      couponId,
      discount,
      subTotal,
      billingAddress,
      taxPercentage,
      taxValue,
      postal_code,
      country_code,
    } = createPaymentIntentDto;
    if (!billingAddress) {
      throw new UnprocessableEntityException('Missing Address Details');
    }
    if (!(currency > 0) || !(total > 0) || !(subTotal > 0)) {
      throw new UnprocessableEntityException(
        'Provide proper currency, total and subtotal',
      );
    }

    const backitems = await getRepository(Cart)
      .createQueryBuilder('cart')
      .select(
        'cart.cartSessionId as cartId,cartProduct.productId as productId,cartProduct.price as price ,cartProduct.quantity as quantity',
      )
      .addSelect('product.productName as productName')
      .leftJoin('cart.cartProduct', 'cartProduct')
      .innerJoin('cartProduct.product', 'product')
      .andWhere('cart.email =:email', { email: emailId })
      .getRawMany();

    let itemsListForTax = [];
    // Extract prices from 'items' and calculate the sum
    const subtotalPrice = backitems.reduce((total, item, index) => {
      // Assuming 'price' is a numerical value in each 'item'
      itemsListForTax.push({
        amount: parseFloat(item.price),
        reference: `${item.productName}${index}`,
      });
      return total + parseFloat(item.price);
    }, 0);
    console.log('SubTotal Price:', subtotalPrice);

    const productIdArray = backitems.map((item) => item.productId);
    console.log(productIdArray);

    const memberdata = await this.membersService.findOne({ email: emailId });
    let coupon;
    let promoCode;
    let backcoupon;
    let backTotal;
    if (couponId) {
      coupon = await getRepository(PromoCode).findOne({ id: couponId });
      promoCode = {
        totalAmount: subtotalPrice,
        promoCode: coupon?.promoCode ? coupon?.promoCode : '',
        memberuuid: memberdata?.memberuuid ? memberdata?.memberuuid : '',
        productIds: productIdArray,
      };
      if (promoCode) {
        backcoupon = await this.promoCodeService.findOne(promoCode);
        if (backcoupon.discountType == 'Percentage') {
          backTotal =
            subtotalPrice - (subtotalPrice * backcoupon.discountValue) / 100;
        } else {
          backTotal = subtotalPrice - backcoupon.discountValue;
        }
      }
    } else {
      backTotal = subtotalPrice;
    }

    const currencyRes = await this.currenciesService.findOne(currency);
    const stripe = new Stripe(
      `${this.configService.get('app.stripeSecretKey')}`,
    );
    if (currency == DEFAULT_VALUES.CURRENCY) {
      const calculation = await stripe.tax.calculations.create({
        currency: currencyRes.currencyCode,
        line_items: itemsListForTax,
        customer_details: {
          address: {
            // line1:'92 McPherson Road '   ,
            // city: 'GREAT SOUTHERN',
            //  state: 'VIC',
            //  postal_code: postal_code,
            country: country_code, //(billingAddress.country).substring(0, 2)
          },
          address_source: 'billing',
        },
        expand: ['line_items.data.tax_breakdown'],
      });

      if (calculation && calculation.tax_breakdown.length > 0) {
        calculation.tax_breakdown.forEach((item) => {
          backTotal = backTotal + item.amount;
        });
      }
    }

    console.log(
      `==================backTotal:${Number(
        backTotal.toFixed(2),
      )},'total:'${total},'subtotalPrice:${Number(
        subtotalPrice,
      )},'subTotal:'${subTotal}`,
    );
    if (
      !(total == Number(backTotal.toFixed(2))) ||
      !(subTotal == Number(subtotalPrice))
    ) {
      throw new UnprocessableEntityException('Data Altered !!!!');
    }

    const member = await this.membersService.findOne({ email: emailId });
    const paymentMethodRes = await this.paymentMethodsService.findOne({
      id: 1,
    });
    const memberPaymentAccess =
      await this.memberPaymentAccessService.getDetails({
        createdBy: member.id,
        paymentMethodId: PAYMENT_METHOD.CARD,
        isActive: true,
      });
    if (
      !(memberPaymentAccess.length > 0) &&
      !memberPaymentAccess[0].customerId &&
      !memberPaymentAccess[0].paymentMethod
    ) {
      throw new HttpException(
        'Customer with card details not found',
        HttpStatus.NOT_FOUND,
      );
    }

    // Each payment method type has support for different currencies. In order to
    // support many payment method types and several currencies, this server
    // endpoint accepts both the payment method type and the currency as
    // parameters.
    //
    // Some example payment method types include `card`, `ideal`, and `alipay`.

    var params = {
      payment_method_types: [paymentMethodRes[0].paymentMethod],
      amount: total * 100,
      currency: currencyRes.currencyCode,
      confirm: true,
      off_session: true,
      customer: memberPaymentAccess[0].customerId,
      payment_method: memberPaymentAccess[0].paymentMethod,
      description: 'Accept Payment',
      shipping: {
        name: member.fullName,
        address: billingAddress,
      },
    };

    /*  if(paymentMethodRes[0].paymentMethod=='card'){
      params.payment_method = paymentMethodId
      params.confirm=true
      }*/

    // Create a PaymentIntent with the amount, currency, and a payment method type.
    //
    // See the documentation [0] for the full list of supported parameters.
    //
    // [0] https://stripe.com/docs/api/payment_intents/create
    try {
      // const stripeSecretKey=this.configService.get('app.stripeSecretKey')
      //  const stripe = new Stripe(`${this.configService.get('app.stripeSecretKey')}`, {
      //   apiVersion: null,
      // });
      const stripe = require('stripe')(
        `${this.configService.get('app.stripeSecretKey')}`,
      );

      const paymentIntent = await stripe.paymentIntents.create(params);
      // Confirm the Payment Intent (replace with your actual Payment Intent ID)
      // const confirmedPaymentIntent = await stripe.paymentIntents.confirm(paymentIntent.id, {
      //   payment_method:  memberPaymentAccess[0].paymentMethod, // replace with the actual payment method
      // });
      const charge = await stripe.charges.retrieve(paymentIntent.latest_charge);

      if (paymentIntent && charge) {
        const orderDto = new CreateOrderDto();
        orderDto.items = items;
        orderDto.sessionId = charge.id;
        orderDto.currencyId = currency;
        orderDto.countryId = DEFAULT_VALUES.COUNTRY;
        orderDto.postalCode = '';
        orderDto.email = emailId;
        orderDto.fullName = member.fullName;
        orderDto.createdBy = member && member.id ? member.id : null;
        orderDto.memberId = member && member.id ? member.id : null;
        let createOrderRes = await this.ordersService.create(orderDto);

        if (createOrderRes) {
          const createTransactionDto = new CreateTransactionDto();
          createTransactionDto.createdBy =
            member && member.id ? member.id : null;
          createTransactionDto.discount = discount;
          createTransactionDto.total = total;
          createTransactionDto.subTotal = subTotal;
          createTransactionDto.taxPercent = taxPercentage;
          createTransactionDto.taxValue = taxValue;
          createTransactionDto.status = charge.status;
          createTransactionDto.paymentStatus =
            charge.paid == true ? PAYMENT_STATUS.PAID : PAYMENT_STATUS.UNPAID;
          createTransactionDto.memberId =
            member && member.id ? member.id : null;
          createTransactionDto.mode = paymentMethodRes[0].paymentMethod;
          createTransactionDto.paymentMethod = PAYMENT_METHOD.CARD;
          createTransactionDto.orderId = createOrderRes.id;
          createTransactionDto.receiptUrl = charge.receipt_url;
          createTransactionDto.transactionId = charge.id;
          if (couponId) {
            createTransactionDto.couponId = couponId;
          }
          const record = await this.orderTransactionRepository.save(
            this.orderTransactionRepository.create(createTransactionDto),
          );
          if (charge.paid == true)
            this.notifyPaymentSuccess(member, charge.id, 'Card', charge);
          if (couponId) {
            this.promocodeRedemption(couponId);
          }
          if (charge.paid == true) {
            items.forEach(async (item) => {
              if (item.productId == PRODUCT.PROMOTED_STALLION) {
                const order = await getRepository(Cart)
                  .createQueryBuilder('cart')
                  .select(
                    'stallionPromotion.endDate,stallion.stallionUuid as stallionId,cartProduct.price',
                  )
                  .innerJoin('cart.cartProduct', 'cartProduct')
                  .innerJoin('cartProduct.cartProductItem', 'cartProductItem')
                  .innerJoin(
                    'cartProductItem.stallionPromotion',
                    'stallionPromotion',
                  )
                  .innerJoin('cartProductItem.stallion', 'stallion')
                  .andWhere('cart.cartSessionId=:cartSessionId', {
                    cartSessionId: item.cartId,
                  })
                  .getRawOne();
                const stallionId = order.stallionId;
                const endDate = order.endDate;
                const price = order.price;
                const currecy = currencyRes.currencyCode;
                await this.stallionPromotionService.notifyAfterPromotion(
                  member,
                  stallionId,
                  endDate,
                  price,
                  currecy,
                );
                console.log('==========order', order);
              }
              if (item.productId === 10) {
                const order = await getRepository(Cart)
                  .createQueryBuilder('cart')
                  .select(
                    'stallionNomination.id as stallionNominationId,stallion.stallionUuid as stallionId ,stallion.id as stallId',
                  )
                  .innerJoin('cart.cartProduct', 'cartProduct')
                  .innerJoin('cartProduct.cartProductItem', 'cartProductItem')
                  .innerJoin(
                    'cartProductItem.nominationrequest',
                    'stallionNomination',
                  )
                  .innerJoin('cartProductItem.stallion', 'stallion')
                  .andWhere('cart.cartSessionId=:cartSessionId', {
                    cartSessionId: item.cartId,
                  })
                  .getRawOne();
                this.closeNomination(order.stallId);
              }
            });
          }
        }
        // if(createOrderRes){ this.ordersService.removeCartItems(emailId) }
      }

      // Send publishable key and charge details to client
      /*return {
        clientSecret: paymentIntent.client_secret,
        nextAction: paymentIntent.next_action,
      }; */
      return charge;
    } catch (e) {
      return {
        error: {
          message: e.message,
        },
      };
    }
  }

  async createStripeCharge(createCheckoutDto: CreateCheckoutDto) {
    const {
      emailId,
      paymentMethodType,
      token,
      currency,
      total,
      items,
      couponId,
      discount,
      subTotal,
      fullName,
      billingAddress,
      taxPercentage,
      taxValue,
      postal_code,
      country_code,
    } = createCheckoutDto;
    if (!(currency > 0) || !(total > 0) || !(subTotal > 0)) {
      throw new UnprocessableEntityException(
        'Provide proper currency, total and subtotal',
      );
    }
    const backitems = await getRepository(Cart)
      .createQueryBuilder('cart')
      .select(
        'cart.cartSessionId as cartId,cartProduct.productId as productId,cartProduct.price as price ,cartProduct.quantity as quantity',
      )
      .addSelect('product.productName as productName')
      .leftJoin('cart.cartProduct', 'cartProduct')
      .innerJoin('cartProduct.product', 'product')
      .andWhere('cart.email =:email', { email: emailId })
      .getRawMany();

    // Extract prices from 'items' and calculate the sum
    let itemsListForTax = [];
    const subtotalPrice = backitems.reduce((total, item, index) => {
      // Assuming 'price' is a numerical value in each 'item'
      itemsListForTax.push({
        amount: parseFloat(item.price),
        reference: `${item.productName}${index}`,
      });
      return total + parseFloat(item.price);
    }, 0);

    const productIdArray = backitems.map((item) => item.productId);
    console.log(productIdArray);

    const memberdata = await this.membersService.findOne({ email: emailId });
    let coupon;
    let promoCode;
    let backcoupon;
    let backTotal;
    if (couponId) {
      coupon = await getRepository(PromoCode).findOne({ id: couponId });
      promoCode = {
        totalAmount: subtotalPrice,
        promoCode: coupon?.promoCode ? coupon?.promoCode : '',
        memberuuid: memberdata?.memberuuid ? memberdata?.memberuuid : '',
        productIds: productIdArray,
      };
      if (promoCode) {
        backcoupon = await this.promoCodeService.findOne(promoCode);
        if (backcoupon.discountType == 'Percentage') {
          backTotal =
            subtotalPrice - (subtotalPrice * backcoupon.discountValue) / 100;
        } else {
          backTotal = subtotalPrice - backcoupon.discountValue;
        }
      }
    } else {
      backTotal = subtotalPrice;
    }

    const currencyRes = await this.currenciesService.findOne(currency);

    //************************calculate & validate tax***************************************

    const stripe = new Stripe(
      `${this.configService.get('app.stripeSecretKey')}`,
    );
    if (currency == DEFAULT_VALUES.CURRENCY) {
      const calculation = await stripe.tax.calculations.create({
        currency: currencyRes.currencyCode,
        line_items: itemsListForTax,
        customer_details: {
          address: {
            // line1:'92 McPherson Road '   ,
            // city: 'GREAT SOUTHERN',
            //  state: 'VIC',
            // postal_code: postal_code,
            country: country_code, // (currencyRes.currencyCode).substring(0, 2)
          },
          address_source: 'billing',
        },
        expand: ['line_items.data.tax_breakdown'],
      });

      if (calculation && calculation.tax_breakdown.length > 0) {
        calculation.tax_breakdown.forEach((item) => {
          backTotal = backTotal + item.amount;
        });
      }
    }

    console.log(
      `==================backTotal:${Number(
        backTotal.toFixed(2),
      )},'total:'${total},'subtotalPrice:${Number(
        subtotalPrice,
      )},'subTotal:'${subTotal}`,
    );
    if (
      !(total == Number(backTotal.toFixed(2))) ||
      !(subTotal == Number(subtotalPrice))
    ) {
      throw new UnprocessableEntityException('Data Altered !!!!');
    }

    const member = await this.membersService.findOne({ email: emailId });
    const paymentMethodRes = await this.paymentMethodsService.findOne({
      id: paymentMethodType,
    });

    /* const memberPaymentAccess= await this.memberPaymentAccessService.getDetails({createdBy:member['id'], paymentMethodId:paymentMethodType, isActive:true}) */

    try {
      const charge = await stripe.charges.create({
        amount: total * 100,
        currency: currencyRes.currencyCode,
        description: 'Accept Payment',
        source: token,
        shipping: {
          name: fullName,
          address: billingAddress,
        },
      });
      if (charge) {
        const orderDto = new CreateOrderDto();
        orderDto.items = items;
        orderDto.sessionId = charge.id;
        orderDto.currencyId = currency;
        orderDto.countryId = DEFAULT_VALUES.COUNTRY;
        orderDto.postalCode = '';
        orderDto.email = emailId;
        orderDto.fullName = fullName;
        orderDto.createdBy = member && member.id ? member.id : null;
        orderDto.memberId = member && member.id ? member.id : null;
        let createOrderRes = await this.ordersService.create(orderDto);
        console.log('====createOrderRes', createOrderRes);
        if (createOrderRes) {
          const createTransactionDto = new CreateTransactionDto();
          createTransactionDto.createdBy =
            member && member.id ? member.id : null;
          createTransactionDto.discount = discount;
          createTransactionDto.total = total;
          createTransactionDto.subTotal = subTotal;
          createTransactionDto.taxPercent = taxPercentage;
          createTransactionDto.taxValue = taxValue;
          createTransactionDto.status = charge.status;
          createTransactionDto.paymentStatus =
            charge.paid == true ? PAYMENT_STATUS.PAID : PAYMENT_STATUS.UNPAID;
          createTransactionDto.memberId =
            member && member.id ? member.id : null;
          createTransactionDto.mode = paymentMethodRes[0].paymentMethod;
          createTransactionDto.paymentMethod = paymentMethodType;
          createTransactionDto.orderId = createOrderRes.id;
          createTransactionDto.receiptUrl = charge.receipt_url;
          createTransactionDto.transactionId = charge.id;
          if (couponId) {
            createTransactionDto.couponId = couponId;
          }
          const record = await this.orderTransactionRepository.save(
            this.orderTransactionRepository.create(createTransactionDto),
          );
          if (charge.paid == true)
            this.notifyPaymentSuccess(member, charge.id, 'Card', charge);
          if (couponId) {
            this.promocodeRedemption(couponId);
          }
          if (charge.paid == true) {
            items.forEach(async (item) => {
              if (item.productId == PRODUCT.PROMOTED_STALLION) {
                const order = await getRepository(Cart)
                  .createQueryBuilder('cart')
                  .select(
                    'stallionPromotion.endDate,stallion.stallionUuid as stallionId,cartProduct.price',
                  )
                  .innerJoin('cart.cartProduct', 'cartProduct')
                  .innerJoin('cartProduct.cartProductItem', 'cartProductItem')
                  .innerJoin(
                    'cartProductItem.stallionPromotion',
                    'stallionPromotion',
                  )
                  .innerJoin('cartProductItem.stallion', 'stallion')
                  .andWhere('cart.cartSessionId=:cartSessionId', {
                    cartSessionId: item.cartId,
                  })
                  .getRawOne();
                const stallionId = order.stallionId;
                const endDate = order.endDate;
                const price = order.price;
                const currecy = currencyRes.currencyCode;
                await this.stallionPromotionService.notifyAfterPromotion(
                  member,
                  stallionId,
                  endDate,
                  price,
                  currecy,
                );
                console.log('==========order', order);
              }
              if (item.productId == 10) {
                const order = await getRepository(Cart)
                  .createQueryBuilder('cart')
                  .select(
                    'stallionNomination.id as stallionNominationId,stallion.stallionUuid as stallionId,stallion.id as stallId',
                  )
                  .innerJoin('cart.cartProduct', 'cartProduct')
                  .innerJoin('cartProduct.cartProductItem', 'cartProductItem')
                  .innerJoin(
                    'cartProductItem.nominationrequest',
                    'stallionNomination',
                  )
                  .innerJoin('cartProductItem.stallion', 'stallion')
                  .andWhere('cart.cartSessionId=:cartSessionId', {
                    cartSessionId: item.cartId,
                  })
                  .getRawOne();
                this.closeNomination(order.stallId);
              }
            });
          }
          if (
            charge.paid == false &&
            charge?.outcome.reason == 'expired_card'
          ) {
            this.expiryCardReminder(charge.customer);
          }
        }
        if (createOrderRes) {
          //  this.ordersService.removeCartItems(emailId)
        }
      } else {
        this.notifyPaymentCancel(emailId);
      }

      return charge;
    } catch (e) {
      return {
        error: {
          message: e.message,
        },
      };
    }
  }

  async estimateTax(estimateTaxDto: EstimateTaxDto) {
    const { currency, total, items, postal_code, country_code } =
      estimateTaxDto;
    const stripe = new Stripe(
      `${this.configService.get('app.stripeSecretKey')}`,
    );

    try {
      const currencyRes = await this.currenciesService.findOne(currency);

      // const calculation = await stripe.tax.calculations.create({
      //   currency: currencyRes.currencyCode,
      //   line_items: items,
      //   customer_details: {
      //     ip_address: ipAddress,
      //   },
      // });

      const calculation = await stripe.tax.calculations.create({
        currency: currencyRes.currencyCode,
        line_items: items,
        customer_details: {
          address: {
            // line1:'92 McPherson Road '   ,
            // city: 'GREAT SOUTHERN',
            //  state: 'VIC',
            postal_code: postal_code,
            country: country_code,
          },
          address_source: 'billing',
        },
        expand: ['line_items.data.tax_breakdown'],
      });

      return {
        message: 'Success',
        data: calculation,
      };
    } catch (err) {
      console.log('errr -->', err);
      return {
        message: err.message,
      };
    }
  }

  async createPaypalPay(createCheckoutDto: CreateCheckoutDto) {
    // const member = this.request.user;
    const {
      emailId,
      paymentMethodType,
      currency,
      total,
      items,
      couponId,
      discount,
      subTotal,
      fullName,
      taxPercentage,
      taxValue,
      postal_code,
      country_code,
    } = createCheckoutDto;
    const backitems = await getRepository(Cart)
      .createQueryBuilder('cart')
      .select(
        'cart.cartSessionId as cartId,cartProduct.productId as productId,cartProduct.price as price ,cartProduct.quantity as quantity',
      )
      .addSelect('product.productName as productName')
      .leftJoin('cart.cartProduct', 'cartProduct')
      .innerJoin('cartProduct.product', 'product')
      .andWhere('cart.email =:email', { email: emailId })
      .getRawMany();

    // Extract prices from 'items' and calculate the sum
    let itemsListForTax = [];
    const subtotalPrice = backitems.reduce((total, item, index) => {
      // Assuming 'price' is a numerical value in each 'item'
      itemsListForTax.push({
        amount: parseFloat(item.price),
        reference: `${item.productName}${index}`,
      });
      return total + parseFloat(item.price);
    }, 0);
    console.log(
      'SubTotal Price:',
      subtotalPrice,
      'itemsListForTax',
      itemsListForTax,
    );

    const productIdArray = backitems.map((item) => item.productId);
    console.log(productIdArray);

    const memberdata = await this.membersService.findOne({ email: emailId });
    let coupon;
    let promoCode;
    let backcoupon;
    let backTotal;
    if (couponId) {
      coupon = await getRepository(PromoCode).findOne({ id: couponId });
      promoCode = {
        totalAmount: subtotalPrice,
        promoCode: coupon?.promoCode ? coupon?.promoCode : '',
        memberuuid: memberdata?.memberuuid ? memberdata?.memberuuid : '',
        productIds: productIdArray,
      };
      if (promoCode) {
        backcoupon = await this.promoCodeService.findOne(promoCode);
        if (backcoupon.discountType == 'Percentage') {
          backTotal =
            subtotalPrice - (subtotalPrice * backcoupon.discountValue) / 100;
        } else {
          backTotal = subtotalPrice - backcoupon.discountValue;
        }
      }
    } else {
      backTotal = subtotalPrice;
    }

    const currencyRes = await this.currenciesService.findOne(currency);

    //************************calculate & validate tax***************************************
    console.log(
      '===================tax loc',
      currencyRes,
      'tax:',
      currencyRes.currencyCode.substring(0, 2),
    );
    const stripe = new Stripe(
      `${this.configService.get('app.stripeSecretKey')}`,
    );
    if (currency == DEFAULT_VALUES.CURRENCY) {
      const calculation = await stripe.tax.calculations.create({
        currency: currencyRes.currencyCode,
        line_items: itemsListForTax,
        customer_details: {
          address: {
            // line1:'92 McPherson Road '   ,
            // city: 'GREAT SOUTHERN',
            //  state: 'VIC',
            //  postal_code: postal_code,
            country: country_code, // (currencyRes.currencyCode).substring(0, 2)
          },
          address_source: 'billing',
        },
        expand: ['line_items.data.tax_breakdown'],
      });

      if (calculation && calculation.tax_breakdown.length > 0) {
        calculation.tax_breakdown.forEach((item) => {
          backTotal = backTotal + item.amount;
        });
      }
    }

    console.log(
      `==================backTotal:${Number(
        backTotal.toFixed(2),
      )},'total:'${total},'subtotalPrice:${Number(
        subtotalPrice,
      )},'subTotal:'${subTotal}`,
    );
    if (
      !(total == Number(backTotal.toFixed(2))) ||
      !(subTotal == Number(subtotalPrice))
    ) {
      throw new UnprocessableEntityException('Data Altered !!!!');
    }

    if (!(currency > 0) || !(total > 0) || !(subTotal > 0)) {
      throw new UnprocessableEntityException(
        'Provide proper currency, total and subtotal',
      );
    }
    const member = await this.membersService.findOne({ email: emailId });
    const paymentMethodRes = await this.paymentMethodsService.findOne({
      id: paymentMethodType,
    });
    let itemsList = [];

    for await (const item of items) {
      var storeItem = await this.productsService.findOne({
        id: item.productId,
      });
      let unitPrice = storeItem.price * 100;
      //1=My Shortlist Report, 2=stallionMatchPro Report 3=Broodmare Affinity Report 4=Stallion Match Sales Report 6=broodMare Sire Report, 7=local boost report, 8=extended boost report
      if (
        PRODUCTCODES.REPORT_SHORTLIST_STALLION == storeItem?.productCode ||
        PRODUCTCODES.REPORT_STALLION_MATCH_SALES == storeItem.productCode
      ) {
        unitPrice = storeItem.price * item.quantity * 100;
      }

      itemsList.push({
        name: storeItem.productName,
        sku: item.productId,
        price: storeItem.price,
        currency: currencyRes.currencyCode,
        quantity: item.quantity,
      });
    }

    const returnUrl = this.configService.get('file.returnPaypalUrl');
    const create_payment_json = {
      intent: 'sale',
      payer: {
        payment_method:
          paymentMethodRes.length > 0 ? paymentMethodRes[0].paymentMethod : 2,
      },
      redirect_urls: {
        return_url:
          returnUrl +
          `/thankyou?status='success'&email=${emailId}&couponId=${couponId}`,
        cancel_url: returnUrl + '/checkout',
      },
      transactions: [
        {
          /* "item_list": {
             "items": itemsList
         },*/
          amount: {
            currency: currencyRes.currencyCode,
            total: total,
          },
          // "description": "Washing Bar soap"
        },
      ],
    };

    const paymentObj = new Promise(function (resolve, reject) {
      paypal.payment.create(
        create_payment_json,
        async function (error: any, payment: any) {
          if (error) {
            reject(error);
          } else {
            resolve(payment);
          }
        },
      );
    });

    return paymentObj
      .then(async (res) => {
        let result = JSON.parse(JSON.stringify(res));
        // if (result.links.length > 0) {
        //   const orderDto = new CreateOrderDto()
        //   orderDto.items = createCheckoutDto.items
        //   orderDto.sessionId = result.id
        //   orderDto.currencyId = currency
        //   orderDto.countryId = DEFAULT_VALUES.COUNTRY
        //   orderDto.postalCode = ''
        //   orderDto.email = emailId
        //   orderDto.fullName = fullName
        //   orderDto.createdBy = (member && member.id) ? member.id : null
        //   orderDto.memberId = (member && member.id) ? member.id : null
        //   let createOrderRes = await this.ordersService.create(orderDto)

        //   if (createOrderRes) {
        //     const createTransactionDto = new CreateTransactionDto()
        //     createTransactionDto.createdBy = (member && member.id) ? member.id : null
        //     createTransactionDto.discount = createCheckoutDto.discount;
        //     createTransactionDto.total = createCheckoutDto.total;
        //     createTransactionDto.subTotal = createCheckoutDto.subTotal;
        //     createTransactionDto.taxPercent = taxPercentage;
        //     createTransactionDto.taxValue = taxValue;
        //     createTransactionDto.status = 'open';
        //     createTransactionDto.paymentStatus = 1;
        //     createTransactionDto.memberId = (member && member.id) ? member.id : null
        //     createTransactionDto.mode = result.intent
        //     createTransactionDto.paymentMethod = 2
        //     createTransactionDto.orderId = createOrderRes.id
        //     createTransactionDto.transactionId = result.id
        //     if (createCheckoutDto.couponId) {
        //       createTransactionDto.couponId = createCheckoutDto.couponId
        //       this.promocodeRedemption(createTransactionDto.couponId)
        //     }
        //     const record = await this.orderTransactionRepository.save(
        //       this.orderTransactionRepository.create(createTransactionDto),
        //     );
        //   }
        // }
        for (let i = 0; i < result.links.length; i++) {
          if (result.links[i].rel === 'approval_url') {
            console.log('=================approval_url', result.links[i].href);
            return result.links[i].href;
          }
        }
      })
      .catch((err) => {
        console.log('=================errorl', err);
        return { error: err };
      });
  }

  async paypalSuccess(paypalSuccessDto: PaypalSuccessDto) {
    console.log('==========inside paypalSuccess', paypalSuccessDto);
    const payerId = paypalSuccessDto.PayerID;
    const paymentId = paypalSuccessDto.paymentId;
    const email = paypalSuccessDto.email;
    const backitems = await getRepository(Cart)
      .createQueryBuilder('cart')
      .select(
        'cart.cartSessionId as cartId,cartProduct.productId as productId,cartProduct.price as price ,cartProduct.quantity as quantity,cart.currencyId as currency,cart.fullName as fullName',
      )
      .leftJoin('cart.cartProduct', 'cartProduct')
      .andWhere('cart.email =:email', { email: paypalSuccessDto.email })
      .getRawMany();
    console.log('=================backitems', backitems);
    //   const subtotalPrice = backitems.reduce((total, item) => {
    //     // Assuming 'price' is a numerical value in each 'item'
    //     return total + parseFloat(item.price);
    // }, 0);
    // console.log('SubTotal Price:', subtotalPrice);
    let itemsListForTax = [];
    const subtotalPrice = backitems.reduce((total, item, index) => {
      // Assuming 'price' is a numerical value in each 'item'
      itemsListForTax.push({
        amount: parseFloat(item.price),
        reference: `${item.productName}${index}`,
      });
      return total + parseFloat(item.price);
    }, 0);
    console.log('=================itemsListForTax', itemsListForTax);
    // const productIdArray = backitems.map(item => item.productId);
    // console.log(productIdArray);
    const productIdArray = backitems.map((item) => ({
      cartId: item.cartId,
      productId: item.productId,
      quantity: item.quantity,
    }));

    const memberdata = await this.membersService.findOne({
      email: paypalSuccessDto.email,
    });
    let coupon;
    let promoCode;
    let backcoupon;
    let backTotal;
    let discount;
    if (paypalSuccessDto.couponId) {
      coupon = await getRepository(PromoCode).findOne({
        id: paypalSuccessDto.couponId,
      });
      promoCode = {
        totalAmount: subtotalPrice,
        promoCode: coupon?.promoCode ? coupon?.promoCode : '',
        memberuuid: memberdata?.memberuuid ? memberdata?.memberuuid : '',
        productIds: productIdArray,
      };
      if (promoCode) {
        backcoupon = await this.promoCodeService.findOne(promoCode);
        if (backcoupon.discountType == 'Percentage') {
          discount = (subtotalPrice * backcoupon.discountValue) / 100;
          backTotal = subtotalPrice - discount;
        } else {
          discount = backcoupon.discountValue;
          backTotal = subtotalPrice - discount;
        }
      }
    } else {
      backTotal = subtotalPrice;
    }
    const currcy: number = backitems[0].currency; // Accessing currencyId specifically
    console.log('*******************', currcy);
    const currencyResp = await this.currenciesService.findOne(currcy);

    //************************calculate & validate tax***************************************

    const stripe = new Stripe(
      `${this.configService.get('app.stripeSecretKey')}`,
    );
    if (currcy == DEFAULT_VALUES.CURRENCY) {
      const calculation = await stripe.tax.calculations.create({
        currency: currencyResp.currencyCode,
        line_items: itemsListForTax,
        customer_details: {
          address: {
            // line1:'92 McPherson Road '   ,
            // city: 'GREAT SOUTHERN',
            //  state: 'VIC',
            //  postal_code:paypalSuccessDto.postal_code,
            country: paypalSuccessDto.country_code, // (currencyResp.currencyCode).substring(0, 2)
          },
          address_source: 'billing',
        },
        expand: ['line_items.data.tax_breakdown'],
      });

      if (calculation && calculation.tax_breakdown.length > 0) {
        calculation.tax_breakdown.forEach((item) => {
          backTotal = backTotal + item.amount;
        });
      }
    }
    const member = await this.membersService.findOne({
      email: paypalSuccessDto.email,
    });
    const orderDto = new CreateOrderDto();
    orderDto.items = productIdArray;
    orderDto.sessionId = paymentId;
    orderDto.currencyId = backitems[0].currency;
    orderDto.countryId = DEFAULT_VALUES.COUNTRY;
    orderDto.postalCode = '';
    orderDto.email = paypalSuccessDto.email;
    orderDto.fullName = backitems[0].fullName;
    orderDto.createdBy = member && member.id ? member.id : null;
    orderDto.memberId = member && member.id ? member.id : null;

    let createOrderRes = await this.ordersService.create(orderDto);
    console.log('===createOrderRes', createOrderRes);
    if (createOrderRes) {
      const createTransactionDto = new CreateTransactionDto();
      createTransactionDto.createdBy = member && member.id ? member.id : null;
      createTransactionDto.discount = discount;
      createTransactionDto.total = backTotal;
      createTransactionDto.subTotal = subtotalPrice;
      createTransactionDto.status = 'open';
      createTransactionDto.paymentStatus = PAYMENT_STATUS.UNPAID;
      createTransactionDto.memberId = member && member.id ? member.id : null;
      createTransactionDto.mode = 'sale';
      createTransactionDto.paymentMethod = PAYMENT_METHOD.PAYPAL;
      createTransactionDto.orderId = createOrderRes.id;
      createTransactionDto.transactionId = paypalSuccessDto.paymentId;
      if (paypalSuccessDto.couponId) {
        createTransactionDto.couponId = paypalSuccessDto.couponId;
        this.promocodeRedemption(createTransactionDto.couponId);
      }
      const record = await this.orderTransactionRepository.save(
        this.orderTransactionRepository.create(createTransactionDto),
      );
    }
    let orderRes;
    if (createOrderRes) {
      orderRes = await this.ordersService.findOne({
        sessionId: paypalSuccessDto.paymentId,
      });
      if (!orderRes && !(orderRes.length > 0)) {
        throw new UnprocessableEntityException('Order not found');
      }
    }
    const orderTxRes = await this.orderTransactionRepository.findOne({
      orderId: orderRes[0].id,
    });
    const currencyRes = await this.currenciesService.findOne(
      orderRes[0].currencyId,
    );
    const execute_payment_json = {
      payer_id: payerId,
      transactions: [
        {
          amount: {
            currency: currencyRes.currencyCode,
            total: orderTxRes.total,
          },
        },
      ],
    };

    // Obtains the transaction details from paypal
    const paymentRes = await new Promise(function (resolve, reject) {
      paypal.payment.execute(
        paymentId,
        execute_payment_json,
        async function (error: any, payment: any) {
          if (error) {
            reject(error);
          } else {
            //  resolve('success') ;
            resolve(JSON.stringify(payment));
          }
        },
      );
    });
    if (paymentRes) {
      const createTransactionDto = new CreateTransactionDto();
      createTransactionDto.createdBy = orderTxRes.createdBy;
      createTransactionDto.discount = orderTxRes.discount;
      createTransactionDto.total = orderTxRes.total;
      createTransactionDto.subTotal = orderTxRes.subTotal;
      createTransactionDto.status = 'succeeded';
      createTransactionDto.paymentStatus = PAYMENT_STATUS.PAID;
      createTransactionDto.memberId = orderTxRes.memberId;
      createTransactionDto.mode = orderTxRes.mode;
      createTransactionDto.paymentMethod = PAYMENT_METHOD.PAYPAL;
      createTransactionDto.orderId = orderTxRes.orderId;
      createTransactionDto.couponId = orderTxRes.couponId;
      createTransactionDto.payerId = paypalSuccessDto.PayerID;
      createTransactionDto.transactionId = paypalSuccessDto.paymentId;
      //createTransactionDto.receiptUrl=payment.transactions[0].related_resources[0].sale.receipt_id
      const member = await this.membersService.findOne({
        id: orderTxRes.createdBy,
      });
      const record = await this.orderTransactionRepository.update(
        { transactionId: paymentId },
        createTransactionDto,
      );
      this.notifyPaymentSuccess(member, paypalSuccessDto.paymentId, PAYMENT_METHOD_TEXT.PAYPAL);
      //  if(paypalSuccessDto.paymentId ){
      const items = await getRepository(OrderProduct)
        .createQueryBuilder('op')
        .select('op.id as orderProductId ,op.orderId, op.productId')
        .andWhere('op.orderId=:orderId', { orderId: orderTxRes.orderId })
        .getRawMany();
      console.log('==========prod', items);
      items.forEach(async (item) => {
        if (item.productId == PRODUCT.PROMOTED_STALLION) {
          let order = await getRepository(Order)
            .createQueryBuilder('order')
            .select(
              'stallionPromotion.endDate,stallion.stallionUuid as stallionId,orderProduct.price',
            )
            .innerJoin('order.orderProduct', 'orderProduct')
            .innerJoin('orderProduct.orderProductItem', 'orderProductItem')
            .innerJoin(
              'orderProductItem.stallionPromotion',
              'stallionPromotion',
            )
            .innerJoin('orderProductItem.stallion', 'stallion')
            .andWhere('orderProduct.id=:id', { id: item.orderProductId })
            .getRawOne();
          const stallionId = order.stallionId;
          const endDate = order.endDate;
          const price = order.price;
          const currency = currencyRes.currencyCode;
          await this.stallionPromotionService.notifyAfterPromotion(
            member,
            stallionId,
            endDate,
            price,
            currency,
          );
          console.log('==========order', order);
        }
        if (item.productId === 10) {
          const order = await getRepository(Order)
            .createQueryBuilder('order')
            .select(
              'stallionNomination.id as stallionNominationId,stallion.stallionUuid as stallionId,stallion.id as stallId',
            )
            .innerJoin('order.orderProduct', 'orderProduct')
            .innerJoin('orderProduct.orderProductItem', 'orderProductItem')
            .innerJoin(
              'orderProductItem.nominationrequest',
              'stallionNomination',
            )
            .innerJoin('orderProductItem.stallion', 'stallion')
            .andWhere('orderProduct.id=:id', { id: item.orderProductId })
            .getRawOne();
          this.closeNomination(order.stallId);
        }
      });

      //  }

      //return paymentRes;
      if (record) {
        return 'success';
      } else false;
    } else {
      throw new UnprocessableEntityException('Not exist!');
    }
  }

  async paypalCancel(paypalSuccessDto: PaypalSuccessDto) {
    const payerId = paypalSuccessDto.PayerID;
    const paymentId = paypalSuccessDto.paymentId;
    const orderTxRes = await this.orderTransactionRepository.findOne({
      sessionId: paypalSuccessDto.paymentId,
    });
    const execute_payment_json = {
      payer_id: payerId,
      transactions: [
        {
          amount: {
            currency: 'AUD',
            total: orderTxRes.total,
          },
        },
      ],
    };

    // Obtains the transaction details from paypal
    return new Promise(function (resolve, reject) {
      paypal.payment.execute(
        paymentId,
        execute_payment_json,
        function (error: any, payment: any) {
          //When error occurs when due to non-existent transaction, throw an error else log the transaction details in the console then send a Success string reposponse to the user.
          if (error) {
            console.log(error.response);
            reject(error);
          } else {
            console.log(JSON.stringify(payment));
            resolve('Canceled');
          }
        },
      );
    });
  }

  async findAll(
    searchOptionsDto: PageOptionsDto,
  ): Promise<PageDto<OrderTransaction>> {
    const member = this.request.user;

    const queryBuilder = this.orderTransactionRepository
      .createQueryBuilder('orderTransaction')
      .select(
        'orderTransaction.orderId as orderIdNum,orderTransaction.transactionId as orderId, orderTransaction.status, orderTransaction.total as total, orderTransaction.subTotal, orderTransaction.discount, orderTransaction.createdOn as orderCreatedOn, orderTransaction.receiptUrl as receiptUrl, orderTransaction.mode as paymentMode, orderTransaction.payerId, 1 as productDetails, 0 as cardDetails',
      )
      .addSelect('paymentstatus.statusName as paymentStatus')
      .addSelect('paymentmethod.paymentMethod as paymentMethod')
      .addSelect(
        'promocode.promoCode as promoCode, promocode.discountType as discountType, promocode.price as discountValue',
      )
      .innerJoin('orderTransaction.paymentstatus', 'paymentstatus')
      .innerJoin('orderTransaction.paymentmethod', 'paymentmethod')
      .leftJoin('orderTransaction.promocode', 'promocode')
      .andWhere('orderTransaction.createdBy=:memberId', {
        memberId: member['id'],
      });

    queryBuilder
      .orderBy('orderTransaction.id', searchOptionsDto.order)
      .offset(searchOptionsDto.skip)
      .limit(searchOptionsDto.limit);

    const entities = await queryBuilder.getRawMany();

    const itemCount = await queryBuilder.getCount();
    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: searchOptionsDto,
    });
    const result = await Promise.all(
      entities.map(async (Obj) => {
        const subQueryBuilder = getRepository(OrderProduct)
          .createQueryBuilder('orderProduct')
          .select(
            'orderProduct.id as opId, orderProduct.price as price, orderProduct.quantity as quantity, orderProduct.pdfLink as reportLink, orderProduct.isLinkActive as isLinkActive',
          )
          .addSelect(
            'product.productName as productName,product.productCode as productCode',
          )
          .addSelect(
            'currency.currencySymbol as currencySymbol, currency.currencyCode as currencyCode',
          )
          .addSelect('category.categoryName as productCategoryName')
          .addSelect('orderstatus.status as status')
          .leftJoin('orderProduct.order', 'order')
          .leftJoin(
            'orderProduct.orderstatus',
            'orderstatus',
            'orderstatus.id = orderProduct.orderStatusId',
          )
          .leftJoin('order.currency', 'currency')
          .leftJoin('orderProduct.product', 'product')
          .leftJoin('product.category', 'category')
          .andWhere('orderProduct.orderId=:orderId', {
            orderId: Obj.orderIdNum,
          });
        const subEntities = await subQueryBuilder.getRawMany();

        await subEntities.reduce(async (promise, item) => {
          await promise;

          const sQueryBuilder = getRepository(OrderProductItem)
            .createQueryBuilder('opi')
            .select('opi.mareId as mareId, opi.stallionId as stallionId');

          if (
            item.productCode == 'REPORT_STALLION_AFFINITY' ||
            item.productCode == 'PROMOTION_STALLION'
          ) {
            sQueryBuilder
              .addSelect('horse.horseName as horseName')
              .innerJoin('opi.stallion', 'stallion')
              .innerJoin('stallion.horse', 'horse');
          } else {
            sQueryBuilder
              .addSelect('mare.horseName as horseName')
              .innerJoin('opi.horse', 'mare');
          }
          sQueryBuilder.andWhere('opi.orderProductId = :orderProduct', {
            orderProduct: item.opId,
          });

          const itemInfo = await sQueryBuilder.getRawOne();

          delete item.opId;
          if (itemInfo) {
            item.horseName = itemInfo?.horseName;
          }
        }, Promise.resolve());

        Obj.productDetails = subEntities;
        Obj.downloadStatus = await this.isDownloadable(subEntities);

        if (Obj.paymentMode.trim() == 'card') {
          let cardDetails = await this.ordersService.getMaskedCardNumber(
            Obj.orderId,
          );
          Obj.cardDetails = {
            brand: cardDetails.brand,
            last4: cardDetails.last4,
          };
        }
      }),
    );

    return new PageDto(entities, pageMetaDto);
  }

  async isDownloadable(reportList) {
    let downloadStatus = false;
    for (let item of reportList) {
      if (PRODUCTCODESLIST.includes(item.productCode)) {
        downloadStatus = true;
        break;
      }
    }
    return downloadStatus;
  }

  async findOrderInfo(sessionId) {
    const member = this.request.user;
    const record = await this.ordersService.findOne({ sessionId });
    if (!record) {
      throw new UnprocessableEntityException('Not exist!');
    }
    /* const queryBuilder = getRepository(Order).createQueryBuilder("order")
     .select('order.sessionId as orderId, order.total as total')
     .addSelect('orderProduct.price as productPrice,orderProduct.quantity as quntity')
     .addSelect('product.productName')
     .leftJoin('order.orderProduct', 'orderProduct')
     .innerJoin('orderProduct.product', 'product')
     .andWhere("order.createdBy=:memberId", { memberId: member['id'] })

     const entities = await queryBuilder.getRawMany();

     return entities */

    const queryBuilder = getRepository(Order)
      .createQueryBuilder('order')
      .select(
        'order.id as orderId, order.sessionId as orderSessionId, order.currencyId as currencyId, order.countryId as countryId',
      )
      .addSelect(
        'orderProduct.id as orderProductId,orderProduct.productId as productId, orderProduct.price as price, orderProduct.quantity as quantity',
      )
      .addSelect(
        'orderProductItem.stallionId, orderProductItem.farmId, orderProductItem.mareId, orderProductItem.stallionPromotionId, orderProductItem.stallionNominationId, orderProductItem.boostProfileId',
      )
      .addSelect('product.productName as productName')
      .addSelect('mare.horseName as mareName')
      .addSelect(
        'currency.currencyName as currencyName, currency.currencyCode as currencyCode',
      )
      .addSelect('stallionPromotion.endDate as expiryDate')
      .leftJoin('order.orderProduct', 'orderProduct')
      .innerJoin('orderProduct.orderProductItem', 'orderProductItem')
      .leftJoin('order.currency', 'currency')
      .leftJoin('orderProduct.product', 'product')
      .leftJoin(
        'orderProductItem.horse',
        'mare',
        'mare.isVerified=1 AND mare.isActive=1',
      )
      .leftJoin('orderProductItem.stallionPromotion', 'stallionPromotion')
      .andWhere('order.email=:emailId', { emailId: member['email'] })
      .andWhere('order.sessionId=:sessionId', { sessionId: sessionId });

    const entities = await queryBuilder.getRawMany();
    return entities;
  }

  findOne(feilds) {
    return this.orderTransactionRepository.find({
      where: feilds,
    });
  }

  async findLatestOrder(transactionId) {
    const queryBuilder = this.orderTransactionRepository
      .createQueryBuilder('orderTransaction')
      .select(
        'orderTransaction.transactionId as transactionId, orderTransaction.orderId, orderTransaction.total, orderTransaction.subTotal, orderTransaction.discount,orderTransaction.mode,orderTransaction.paymentStatus,orderTransaction.paymentMethod, orderTransaction.createdOn, orderTransaction.createdBy, orderTransaction.taxPercent as taxPercentage,orderTransaction.taxValue',
      )
      .addSelect('paymentmethod.paymentMethod as paymentMethodName')
      .addSelect('paymentstatus.statusName as paymentStatusName')
      .leftJoin('orderTransaction.paymentmethod', 'paymentmethod')
      .leftJoin('orderTransaction.paymentstatus', 'paymentstatus')
      .andWhere('orderTransaction.transactionId=:transactionId', {
        transactionId: transactionId,
      })
      .orderBy('orderTransaction.id', 'DESC')
      .limit(1);

    const entities = await queryBuilder.getRawMany();

    const subQueryBuilder = getRepository(Order)
      .createQueryBuilder('order')
      .select(
        'order.id as orderId, order.sessionId as orderSessionId, order.currencyId as currencyId, order.countryId as countryId',
      )
      .addSelect(
        'orderProduct.id as orderProductId,orderProduct.productId as productId, orderProduct.price as price, orderProduct.quantity as quantity, orderProduct.pdfLink as pdfLink',
      )
      .addSelect(
        'orderProductItem.stallionId, orderProductItem.farmId, orderProductItem.mareId, orderProductItem.stallionPromotionId, orderProductItem.stallionNominationId, orderProductItem.boostProfileId',
      )
      .addSelect('product.productName as productName')
      .addSelect('mare.horseName as mareName')
      .addSelect(
        'currency.currencyName as currencyName, currency.currencyCode as currencyCode, currency.currencySymbol as currencySymbol',
      )
      .addSelect('stallionPromotion.endDate as expiryDate')
      .leftJoin('order.orderProduct', 'orderProduct')
      .leftJoin('orderProduct.orderProductItem', 'orderProductItem')
      .leftJoin('order.currency', 'currency')
      .leftJoin('orderProduct.product', 'product')
      .leftJoin(
        'orderProductItem.horse',
        'mare',
        'mare.isVerified=1 AND mare.isActive=1',
      )
      .leftJoin('orderProductItem.stallionPromotion', 'stallionPromotion')
      .andWhere('order.id=:orderId', { orderId: entities[0].orderId });

    const subEntities = await subQueryBuilder.getRawMany();
    const keys = ['orderProductId'];
    const filtered = subEntities.filter(
      (
        (s) => (o) =>
          ((k) => !s.has(k) && s.add(k))(keys.map((k) => o[k]).join('|'))
      )(new Set()),
    );
    entities[0].orderedItems = filtered;
    if (entities[0].mode.trim() == 'card') {
      const customer = await this.memberPaymentAccessService.findByEntity({
        paymentMethodId: PAYMENT_METHOD.CARD,
        createdBy: entities[0].createdBy,
      });
      if (customer && customer.length > 0) {
        const stripe = new Stripe(
          `${this.configService.get('app.stripeSecretKey')}`,
          {
            apiVersion: null,
          },
        );
        let pamentMethodsRes = await stripe.paymentMethods.list({
          customer: customer[0].customerId,
          type: 'card',
        });
        if (pamentMethodsRes && pamentMethodsRes.data.length > 0) {
          entities[0].cardDetails = pamentMethodsRes.data[0].card;
        }
      }
    }

    return entities;
  }

  async createInvoice() {
    const member = this.request.user;
    /*  const invoice = await stripe.invoices.retrieve(
        'in_1Lf1b72eZvKYlo2CqE68TtHq'
      );
     return invoice; */
  }

  async getInvoice() {
    var invoiceId = 'INV2-9DRB-YTHU-2V9Q-7Q24';

    /* paypal.invoice.get(invoiceId, function (error, invoice) {
        if (error) {
            return error;
        } else {
            console.log("Get Invoice Response");
            console.log(JSON.stringify(invoice));
            return JSON.stringify(invoice);
            
        }
    }); */

    paypal.invoice.list(function (error, invoices) {
      if (error) {
        throw error;
      } else {
        console.log(JSON.stringify(invoices));
      }
    });
  }

  async delete(id: number) {
    const record = await this.orderTransactionRepository.findOne(id);
    if (!record) {
      throw new UnprocessableEntityException('Not exist!');
    }
    const member = this.request.user;
    const response = await this.orderTransactionRepository.delete(id);
    return response;
  }

  async checkout(createCheckoutDto: CreateCheckoutDto) {
    try {
      // Create a checkout session with Stripe
      //  const itemsList = createCheckoutDto.items
      const member = await this.membersService.findOne({
        email: createCheckoutDto.emailId,
      });
      const line_items = [];
      for await (const item of createCheckoutDto.items) {
        var storeItem = await this.productsService.findOne({
          id: item.productId,
        });
        let unitPrice = storeItem.price * 100;
        //1=My Shortlist Report, 2=stallionMatchPro Report 3=Broodmare Affinity Report 4=Stallion Match Sales Report 6=broodMare Sire Report, 7=local boost report, 8=extended boost report
        if (
          PRODUCTCODES.REPORT_SHORTLIST_STALLION == storeItem?.productCode ||
          PRODUCTCODES.REPORT_STALLION_MATCH_SALES == storeItem.productCode
        ) {
          unitPrice = storeItem.price * item.quantity * 100;
        }

        line_items.push({
          price_data: {
            currency: 'usd',
            product_data: {
              name: storeItem.productName,
              description: storeItem.productName,
              metadata: {
                item_id: storeItem.id,
              },
            },
            unit_amount: unitPrice,
            //discount:createCheckoutDto.discount
          },
          quantity: 1,
        });
      }

      const stripe = new Stripe(
        `${this.configService.get('app.stripeSecretKey')}`,
        {
          apiVersion: null,
        },
      );
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        // For each item use the id to get it's details
        // Take that information and convert it to Stripe's format
        line_items: line_items,
        mode: 'payment',
        // discounts:[{coupon:'TS0EQJHH'}],
        // Set a success and cancel URL we will send customers to
        // They are complete urls
        success_url: `${process.env.CLIENT_URL}/thankyou`,
        cancel_url: `${process.env.CLIENT_URL}/cancel`,
      });

      if (session) {
        const orderDto = new CreateOrderDto();
        orderDto.items = createCheckoutDto.items;
        orderDto.sessionId = session.id;
        orderDto.currencyId = DEFAULT_VALUES.CURRENCY;
        orderDto.countryId = DEFAULT_VALUES.COUNTRY;
        orderDto.postalCode = '';
        let createOrderRes = await this.ordersService.create(orderDto);

        if (createOrderRes) {
          const createTransactionDto = new CreateTransactionDto();
          createTransactionDto.sessionId = session.id;
          createTransactionDto.createdBy = member.id;
          createTransactionDto.discount = createCheckoutDto.discount;
          createTransactionDto.total = createCheckoutDto.total;
          createTransactionDto.subTotal = createCheckoutDto.subTotal;
          createTransactionDto.status = session.status;
          createTransactionDto.paymentStatus = PAYMENT_STATUS.UNPAID;
          createTransactionDto.memberId = member.id;
          createTransactionDto.mode = session.mode;
          createTransactionDto.paymentMethod = PAYMENT_METHOD.CARD;
          createTransactionDto.orderId = createOrderRes.id;
          createTransactionDto.paymentIntent =
            session.payment_intent.toString();
          if (createCheckoutDto.couponId) {
            createTransactionDto.couponId = createCheckoutDto.couponId;
          }
          const record = await this.orderTransactionRepository.save(
            this.orderTransactionRepository.create(createTransactionDto),
          );

          return { url: session.url };
        }
      }
    } catch (e) {
      // If there is an error send it to the client
      return { error: e.message };
    }
  }

  async config() {
    return {
      //publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      publishableKey:
        'pk_test_51KbvAgKW4289ZuyIRGWnE4GoUtjqsILJDTmXcxalfJpZHAm4O64rnErPJVd7WpQGeilM5LFwqik8NZmkBLzM2mL3004qmwJTpr',
    };
  }

  async webhook(buf) {
    const req = this.request;
    let data, eventType;
    // Check if webhook signing is configured.
    if (process.env.STRIPE_WEBHOOK_SECRET) {
      // Retrieve the event by verifying the signature using the raw body and secret.
      let event;

      let signature = req.headers['stripe-signature'];

      try {
        const stripe = new Stripe(
          `${this.configService.get('app.stripeSecretKey')}`,
          {
            apiVersion: null,
          },
        );
        event = stripe.webhooks.constructEvent(
          buf.toString(),
          signature,
          'whsec_f92d2ddd788276da71bbeeaef671c7faf4b02af18d147c681a721ae451df4ecd',
        );
      } catch (err) {
        console.log(`⚠️  Webhook signature verification failed.`);
        return HttpStatus.BAD_REQUEST;
        //return res.sendStatus(400);
      }
      data = event.data;
      eventType = event.type;
    } else {
      // Webhook signing is recommended, but if the secret is not configured in `config.js`,
      // we can retrieve the event data directly from the request body.
      data = req.body.data;
      eventType = req.body.type;
    }

    // Handle the checkout.session.completed event
    if (eventType === 'checkout.session.completed') {
      // Fulfill the purchase...
      this.fulfillOrder(data, { paymentStatus: PAYMENT_STATUS.PAID, paymentMethod: 1 });
      const orderTx = await this.orderTransactionRepository.find({
        where: { sessionId: data.object.id },
      });
      // this.ordersService.removeCartItems(orderTx[0].createdBy)
    }

    if (eventType === 'payment_intent.succeeded') {
      // Funds have been captured
      // Fulfill any orders, e-mail receipts, etc
      // To cancel the payment after capture you will need to issue a Refund (https://stripe.com/docs/api/refunds)
      console.log('💰 Payment captured!');
      // Fulfill the purchase...
      this.fulfillOrder(data, { paymentStatus: PAYMENT_STATUS.PAID, paymentMethod: 1 });

      //fulfillOrder(data);
    } else if (eventType === 'payment_intent.payment_failed') {
      this.fulfillOrder(data, { paymentStatus: PAYMENT_STATUS.UNPAID, paymentMethod: 1 });
      console.log('❌ Payment failed.');
    }
    //res.sendStatus(200);
    return HttpStatus.OK;
  }

  async fulfillOrder(session, obj) {
    // TODO: fill me in
    let orderRes = await this.orderTransactionRepository.findOne({
      where: { sessionId: session.object.id },
    });
    const createTransactionDto = new CreateTransactionDto();
    createTransactionDto.orderId = orderRes.orderId;
    createTransactionDto.sessionId = session.object.id;
    createTransactionDto.createdBy = orderRes.createdBy;
    createTransactionDto.discount = orderRes.discount;
    createTransactionDto.total = orderRes.total;
    createTransactionDto.subTotal = orderRes.subTotal;
    createTransactionDto.status = session.object.status;
    createTransactionDto.paymentStatus = obj.paymentStatus;
    createTransactionDto.memberId = orderRes.memberId;
    createTransactionDto.mode = session.object.mode;
    createTransactionDto.paymentMethod = obj.paymentMethod;
    createTransactionDto.paymentIntent = orderRes.paymentIntent;
    if (orderRes.couponId) {
      createTransactionDto.couponId = orderRes.couponId;
    }
    const record = await this.orderTransactionRepository.save(
      this.orderTransactionRepository.create(createTransactionDto),
    );
  }

  async notifyPaymentSuccess(member, transactionId, type, charge = null) {
    if (member && member['id']) {
      const messageTemplate =
        await this.messageTemplatesService.getMessageTemplateByUuid(
          notificationTemplates.orderConfirmation,
        );
      const messageText = messageTemplate.messageText;
      const messageTitle = messageTemplate.messageTitle;
      let actionUrl = messageTemplate.linkAction
        .replace('{sessionId}', transactionId)
        .toString()
        .trim();
      let preferedNotification =
        await this.preferedNotificationService.getPreferredNotificationByNotificationTypeCode(
          notificationType.SYSTEM_NOTIFICATIONS,
        );

      this.notificationsService.create({
        createdBy: member['id'],
        messageTemplateId: messageTemplate?.id,
        notificationShortUrl: 'notificationShortUrl',
        recipientId: member['id'],
        messageTitle,
        messageText,
        isRead: false,
        notificationType: preferedNotification?.notificationTypeId,
        actionUrl,
      });

      const supperAdmin: any = await this.membersService.getSupperAdmin();

      if (supperAdmin) {
        this.notificationsService.create({
          createdBy: member['id'],
          messageTemplateId: messageTemplate.id,
          notificationShortUrl: 'notificationShortUrl',
          recipientId: supperAdmin.id, //To Admin
          messageTitle,
          messageText,
          isRead: false,
          notificationType: preferedNotification?.notificationTypeId,
        });
      }

      let paymentMethod = type;
      if (paymentMethod !== PAYMENT_METHOD_TEXT.PAYPAL) {
        const cardDetails = charge?.payment_method_details?.card;
        if (cardDetails) {
          paymentMethod = await this.commonUtilsService.toTitleCase(
            cardDetails.brand + ' Ending ****' + cardDetails.last4,
          );
        }
      }

      preferedNotification =
        await this.preferedNotificationService.getPreferredNotificationByNotificationTypeCode(
          notificationType.SYSTEM_NOTIFICATIONS,
          member['id'],
        );

      const reportCoverImagePath =
        this.configService.get('file.pathReportTemplateStylesAdmin') +
        '/images/';
      console.log(
        '=====================================reportCoverImagePath',
        reportCoverImagePath,
      );

      if (!preferedNotification || preferedNotification.isActive) {
        let otherProducts = PRODUCTLIST;
        const orderData: any = await this.findDetailOneByTransactionId(
          transactionId,
        );
        let items = '';
        await orderData?.products.reduce(async (promise, element) => {
          await promise;
          let productDetails = '';
          let annual = '';
          otherProducts = otherProducts.filter(function (obj) {
            return obj.productCode !== element.productCode;
          });
          items =
            items +
            `<table cellspacing="0" cellpadding="0" vertical-align='top' width="510" align="center" style="margin-top: 0px; border-top: solid 1px #DFE1E4; border-bottom: solid 1px #DFE1E4; padding-top: 20px;">`;
          element.mediaUrl =
            reportCoverImagePath +
            (await this.commonUtilsService.getReportCoverImage(
              element.productCode,
            ));
          if (
            element.productCode == 'BOOST_LOCAL' ||
            element.productCode == 'BOOST_EXTENDED'
          ) {
            // Iterate over stallions for BOOST_LOCAL or BOOST_EXTENDED
            const stallions = await getRepository(OrderProductItem)
              .createQueryBuilder('order')
              .select('horse.horseName as stallionName')
              .innerJoin('order.stallion', 'stallion')
              .innerJoin('stallion.horse', 'horse')
              .innerJoin('order.orderproduct', 'orderProduct')
              .innerJoin(
                'orderProduct.OrderTransaction',
                'orderTransaction',
                'orderProduct.orderId=orderTransaction.orderId',
              )
              .andWhere('orderTransaction.transactionId =:transactionId', {
                transactionId: transactionId,
              })
              .andWhere('orderProduct.productId IN (:...productId)', {
                productId: [PRODUCT.LOCAL_BOOST, PRODUCT.EXTENDED_BOOST],
              })
              .getRawMany();
            const price = (element.price / element.quantity).toFixed(2);
            for (const stallion of stallions) {
              items =
                items +
                `
              <tr>
                <td align="left" width="120"><img src="${
                  element.mediaUrl
                }" alt='${await this.commonUtilsService.toTitleCase(
                  element.productName,
                )}' width="120" style="padding-right:0px; width:90px; height:90px; border-radius:8px;object-fit: cover;"/></td>
                <td>
                <h2 style="margin: 0px;  padding:10px 0px 5px 0px; font-family: Arial; font-size:16px; color:#161716; font-weight: 400; line-height: 22px;"><b>${await this.commonUtilsService.toTitleCase(
                  element.productName,
                )}</b> ${annual}</h2>`;
              productDetails = await this.commonUtilsService.toTitleCase(
                stallion.stallionName,
              );
              items =
                items +
                `
                  <p style="margin: 0px;  padding:3px 30px 3px 0px; font-family: Arial; font-size: 16px; color: #626E60; font-weight: 400; line-height: 20px;">${productDetails}</p>`;
              items =
                items +
                `
              </td>
              <td align="right"> 
                  <p style="margin: 0px;  padding:10px 0px 0px 0px; font-family: Arial; font-size:20px; color:#1D472E; font-weight: 400; line-height: 22px;">` +
                orderData.currencyCode +
                ` ` +
                price +
                `</p>
                  <p style="padding-top:30px;color:#007142;font-weight: 500;font-size:18px;">Paid</p>
              </td>
            </tr>`;
            }
          } else {
            items =
              items +
              `
            <tr>
              <td align="left" width="120"><img src="${
                element.mediaUrl
              }" alt='${await this.commonUtilsService.toTitleCase(
                element.productName,
              )}' width="120" style="padding-right:0px; width:90px; height:90px; border-radius:8px;object-fit: cover;"/></td>
              <td>
              <h2 style="margin: 0px;  padding:10px 0px 5px 0px; font-family: Arial; font-size:16px; color:#161716; font-weight: 400; line-height: 22px;"><b>${await this.commonUtilsService.toTitleCase(
                element.productName,
              )}</b> ${annual}</h2>`;

            if (
              element.productCode == 'REPORT_SHORTLIST_STALLION' ||
              element.productCode == 'REPORT_STALLION_MATCH_PRO'
            ) {
              productDetails =
                (await this.commonUtilsService.toTitleCase(element.mareName)) +
                ' x ' +
                element.quantity +
                ' Stallions';
              items =
                items +
                `<p style="margin: 0px;  padding:3px 30px 3px 0px; font-family: Arial; font-size: 16px; color: #626E60; font-weight: 400; line-height: 20px;">${productDetails}</p>`;
            } else if (element.productCode == 'REPORT_STALLION_AFFINITY') {
              productDetails = await this.commonUtilsService.toTitleCase(
                element.stallionName,
              );
              items =
                items +
                `<p style="margin: 0px;  padding:3px 30px 3px 0px; font-family: Arial; font-size: 16px; color: #626E60; font-weight: 400; line-height: 20px;">${productDetails}</p>`;
            } else if (element.productCode == 'PROMOTION_STALLION') {
              productDetails =
                (await this.commonUtilsService.toTitleCase(
                  element.stallionName,
                )) +
                '<br> Renews ' +
                (await this.commonUtilsService.dateFormate(element.expiryDate));
              items =
                items +
                `<p style="margin: 0px;  padding:3px 30px 3px 0px; font-family: Arial; font-size: 16px; color: #626E60; font-weight: 400; line-height: 20px;">${productDetails} </p>`;
            } else if (
              element.productCode == 'REPORT_BROODMARE_AFFINITY' ||
              element.productCode == 'REPORT_BROODMARE_SIRE'
            ) {
              productDetails = await this.commonUtilsService.toTitleCase(
                element.mareName,
              );
              items =
                items +
                `<p style="margin: 0px;  padding:3px 30px 3px 0px; font-family: Arial; font-size: 16px; color: #626E60; font-weight: 400; line-height: 20px;">${productDetails}</p>`;
            }
            // else if (element.productCode == 'BOOST_LOCAL') {
            //  productDetails = await this.commonUtilsService.toTitleCase(element?.stallionName);
            //   items = items + `<p style="margin: 0px;  padding:3px 30px 3px 0px; font-family: Arial; font-size: 16px; color: #626E60; font-weight: 400; line-height: 20px;">${productDetails}</p>`;
            // }
            // else if (element.productCode == 'BOOST_EXTENDED') {
            // //  productDetails = await this.commonUtilsService.toTitleCase(element?.stallionName);
            //   items = items + `<p style="margin: 0px;  padding:3px 30px 3px 0px; font-family: Arial; font-size: 16px; color: #626E60; font-weight: 400; line-height: 20px;">${productDetails}</p>`;
            // }

            items =
              items +
              `
            </td>
            <td align="right"> 
                <p style="margin: 0px;  padding:10px 0px 0px 0px; font-family: Arial; font-size:20px; color:#1D472E; font-weight: 400; line-height: 22px;">` +
              orderData.currencyCode +
              ` ` +
              element.price +
              `</p>
                <p style="padding-top:30px;color:#007142;font-weight: 500;font-size:18px;">Paid</p>
            </td>
        </tr>`;
          }

          `</table>
    `;
        }, Promise.resolve());

        if (!otherProducts.length) {
          otherProducts = PRODUCTLIST.slice(0, 2);
        } else if (otherProducts.length == 1) {
          let temp = PRODUCTLIST.filter(function (obj) {
            return obj.productCode !== otherProducts[0].productCode;
          });
          otherProducts = temp.slice(0, 2);
        } else if (otherProducts.length >= 2) {
          otherProducts = otherProducts.slice(0, 2);
        }
        if (!orderData.couponPrice) {
          orderData.couponPrice = 0;
        }

        let mailData = {
          to: member['email'],
          subject: 'We are pleased to confirm your Stallion Match order.',
          text: '',
          template: '/order-confirm',
          context: {
            userName: await this.commonUtilsService.toTitleCase(
              member['fullName'],
            ),
            viewOrderLink:
              process.env.FRONTEND_DOMAIN +
              '/user/profile?section=OrderHistory',
            orderNumber: orderData?.orderId,
            orderedDate: await this.commonUtilsService.dateFormate(
              orderData?.orderCreatedOn,
            ), // format 22 July, 2022
            orderStatus: await this.commonUtilsService.toTitleCase(
              orderData?.paymentStatus,
            ), //Paid & Pending Delivery
            paymentMethod: paymentMethod, //Visa Ending **** 1234
            subTotal:
              orderData?.currencyCode +
              ' ' +
              orderData?.currencySymbol +
              orderData?.subTotal, //AUD $1160.00
            discountInPer:
              orderData?.discountType === 'Percentage'
                ? (orderData?.couponPrice !== null
                    ? orderData?.couponPrice
                    : 0) + '%'
                : orderData?.couponPrice !== null
                ? orderData?.couponPrice
                : 0, //10%
            discountInValue:
              orderData?.currencyCode +
                ' -' +
                orderData?.currencySymbol +
                orderData?.discount !==
              null
                ? orderData?.discount
                : 0, //AUD - $160.00
            taxInPer:
              orderData?.taxPercentage !== null ? orderData?.taxPercentage : 0, //10%
            taxInValue: orderData?.taxValue !== null ? orderData?.taxValue : 0, //AUD $100.00
            total:
              orderData?.currencyCode +
              ' ' +
              orderData?.currencySymbol +
              orderData?.total,
            items: items,
            otherProducts: otherProducts,
            //promotUrl: process.env.FRONTEND_DOMAIN + '/stallion-roster/' + farm.farmName + '/' + farm.farmUuid,
          },
        };

        this.mailService.sendMailCommon(mailData);

        // return orderData //needs to comment
      }
    }
  }

  async notifyPaymentCancel(memberEmail) {
    const member = await this.membersService.findOne({ email: memberEmail });
    const cartList = await this.cartsService.findPromotedStallionProduct(
      memberEmail,
    );

    if (cartList && cartList.length > 0) {
      const messageTemplate =
        await this.messageTemplatesService.getMessageTemplateByUuid(
          notificationTemplates.cancellationOfStallionDueToPaymentFailureFarms,
        );
      const messageTitle = messageTemplate.messageTitle;
      cartList.forEach(async (Obj) => {
        let stallionName = await this.commonUtilsService.toTitleCase(
          Obj.stallionName,
        );
        let messageText = messageTemplate.messageText
          .replace(
            '{FarmAdminName}',
            await this.commonUtilsService.toTitleCase(member.fullName),
          )
          .replace('{StallionName}', stallionName);
        const preferedNotification =
          await this.preferedNotificationService.getPreferredNotificationByNotificationTypeCode(
            notificationType.SYSTEM_NOTIFICATIONS,
          );

        this.notificationsService.create({
          createdBy: member.id,
          messageTemplateId: messageTemplate?.id,
          notificationShortUrl: 'notificationShortUrl',
          recipientId: member.id,
          messageTitle,
          messageText,
          isRead: false,
          notificationType: preferedNotification?.notificationTypeId,
        });

        const supperAdmin: any = await this.membersService.getSupperAdmin();
        if (supperAdmin) {
          this.notificationsService.create({
            createdBy: member.id,
            messageTemplateId: messageTemplate?.id,
            notificationShortUrl: 'notificationShortUrl',
            recipientId: supperAdmin.id, //To Admin
            messageTitle,
            messageText,
            isRead: false,
            notificationType: preferedNotification?.notificationTypeId,
          });
        }

        let mailData = {
          to: member.email,
          subject: 'Cancellation of stallion due to payment failure',
          text: '',
          template: '/cancellation-of-stallion',
          context: {
            farmAdminName: await this.commonUtilsService.toTitleCase(
              member.fullName,
            ),
            rosterUrl: process.env.FRONTEND_DOMAIN + '/stallion-roster/',
            price: Obj.currencyCode + ' ' + Obj.price, //AUD 440
            stallionName: await this.commonUtilsService.toTitleCase(
              stallionName,
            ), // format 22 July, 2022
            effectiveDate: await this.commonUtilsService.dateFormate(
              Obj.expiryDate,
            ), //Expired 21 April, 2022
            expiredDate: await this.commonUtilsService.dateFormate(
              Obj.expiryDate,
            ),
          },
        };

        this.mailService.sendMailCommon(mailData);
      });
      //return cartList //needs to comment
    }
  }

  async getOrderDetails(sessionId) {
    const member = this.request.user;

    const record = await this.ordersService.findOne({ sessionId });
    if (!record.length) {
      throw new UnprocessableEntityException('Not exist!');
    }

    const queryBuilder = this.orderTransactionRepository
      .createQueryBuilder('orderTransaction')
      .select(
        'orderTransaction.transactionId,orderTransaction.orderId, orderTransaction.status, orderTransaction.total, orderTransaction.subTotal, orderTransaction.discount, orderTransaction.createdOn as orderCreatedOn, orderTransaction.receiptUrl, orderTransaction.mode as paymentMode, orderTransaction.payerId, 1 as productDetails, 0 as cardDetails',
      )
      .addSelect('paymentstatus.statusName as paymentStatus')
      .addSelect('paymentmethod.paymentMethod as paymentMethod')
      .addSelect(
        'promocode.promoCode as promoCode, promocode.discountType as discountType, promocode.price as discountValue',
      )
      .innerJoin('orderTransaction.paymentstatus', 'paymentstatus')
      .innerJoin('orderTransaction.paymentmethod', 'paymentmethod')
      .leftJoin('orderTransaction.promocode', 'promocode')
      .andWhere('orderTransaction.createdBy=:memberId', {
        memberId: member['id'],
      })
      .andWhere('orderTransaction.orderId=:orderId', { orderId: record[0].id });

    let order = await queryBuilder.getRawOne();

    order['productDetails'] = await this.getOrderProductDetails(order.orderId);

    return order;
  }

  async getOrderProductDetails(orderId) {
    const queryBuilder = getRepository(OrderProduct)
      .createQueryBuilder('orderProduct')
      .select('orderProduct.price as price, orderProduct.quantity as quantity')
      .addSelect('product.productName as productName')
      .addSelect(
        'currency.currencySymbol as currencySymbol, currency.currencyCode as currencyCode',
      )
      .addSelect('category.categoryName as productCategoryName')
      .leftJoin('orderProduct.order', 'order')
      .leftJoin('order.currency', 'currency')
      .leftJoin('orderProduct.product', 'product')
      .leftJoin('product.category', 'category')
      .andWhere('orderProduct.orderId=:orderId', { orderId: orderId });

    const entities = await queryBuilder.getRawMany();
    return entities;
  }

  async findDetailOneByTransactionId(id: number) {
    const queryBuilder = getRepository(OrderTransaction)
      .createQueryBuilder('orderTransaction')
      .select(
        'orderTransaction.id as orderTransactionId, orderTransaction.paymentIntent as paymentIntent,orderTransaction.mode as paymentMode, orderTransaction.status as transactionStatus,orderTransaction.total as total,orderTransaction.subTotal as subTotal,orderTransaction.discount as discount, orderTransaction.createdOn as orderCreatedOn, 0 as tax, orderTransaction.taxValue as taxValue, orderTransaction.taxPercent as taxPercentage, orderTransaction.createdBy',
      )
      .addSelect('paymentstatus.statusName as paymentStatus')
      .addSelect('paymentmethod.paymentMethod as paymentMethod')
      .addSelect(
        'order.id as orderId, order.fullName as clientName, order.email as email',
      )
      .addSelect('country.countryCode as countryCode')
      .addSelect(
        'currency.currencyCode as currencyCode, currency.currencySymbol as currencySymbol',
      )
      .addSelect(
        'orderStatus.status as status, orderReportStatus.createdOn as statusTime',
      )
      .addSelect(
        'coupon.promoCode as promoCode, coupon.discountType as discountType, coupon.price as couponPrice',
      )
      .addSelect(
        'orderproduct.quantity as noOfStallions, orderproduct.id as orderProductId, orderproduct.pdfLink as reportLink, orderproduct.isLinkActive as isLinkActive',
      )
      .leftJoin('orderTransaction.paymentstatus', 'paymentstatus')
      .leftJoin('orderTransaction.paymentmethod', 'paymentmethod')
      .leftJoin('orderTransaction.orderproduct', 'orderproduct')
      .leftJoin('orderproduct.order', 'order')
      .leftJoin('orderproduct.orderReportStatus', 'orderReportStatus')
      .leftJoin('orderReportStatus.orderStatus', 'orderStatus')
      .leftJoin('order.country', 'country')
      .leftJoin('order.currency', 'currency')
      .leftJoin('orderTransaction.promocode', 'coupon')
      .andWhere('orderTransaction.transactionId =:transactionId', {
        transactionId: id,
      });

    const entity = await queryBuilder.getRawOne();

    let orderItems: any = await this.ordersService.findDetailOne(
      entity.orderProductId,
    );

    return orderItems;
  }

  async getReportsLink(sessionId) {
    const member = this.request.user;

    const record = await this.ordersService.findOne({ sessionId });
    if (!record.length) {
      throw new UnprocessableEntityException('Not exist!');
    }

    const orderStatus = await this.orderStatusService.findOneByStatusCode(
      ordersStatusList.COMPLETED,
    );

    const queryBuilder = getRepository(Order)
      .createQueryBuilder('order')
      .select('order.sessionId as transactionId')
      .addSelect('orderProduct.pdfLink as reportLink')
      .addSelect('product.productName as productName')
      .innerJoin('order.orderProduct', 'orderProduct')
      .innerJoin('orderProduct.product', 'product')
      .andWhere('order.createdBy = :memberId', { memberId: member['id'] })
      .andWhere('order.id = :id', { id: record[0].id })
      .andWhere('orderProduct.orderStatusId >= :orderStatusId', {
        orderStatusId: orderStatus?.id,
      });

    const reports = await queryBuilder.getRawMany();

    let response = [];
    await reports.forEach(async (item) => {
      response.push(item.reportLink);
    });
    return response;
  }

  async testAutoPay(stallionId: string) {
    const user = this.request.user;
    const queryBuilder = getRepository(Stallion)
      .createQueryBuilder('st')
      .select(
        'st.stallionUuid stallionId, st.createdBy createdBy, st.modifiedOn modifiedOn',
      )
      .addSelect('horse.horseName horseName')
      .addSelect('farm.farmName farmName, farm.farmUuid farmId')
      .addSelect(
        'promotion.id promotionId, promotion.endDate endDate, promotion.isAutoRenew isAutoRenew,promotion.promotedCount promotedCount',
      )
      .innerJoin('st.horse', 'horse')
      .innerJoin('st.farm', 'farm')
      .innerJoin('st.stallionpromotion', 'promotion')
      .andWhere('st.stallionUuid = :stallionId', { stallionId });
    const entities = await queryBuilder.getRawOne();

    if (entities && entities.isAutoRenew) {
      const member = await this.membersService.findOne({ id: user['id'] });
      const promotiomProduct = await this.productsService.findOneByCode(
        PRODUCTCODES.PROMOTION_STALLION,
      );
      const paymentMethodRes = await this.paymentMethodsService.findOne({
        id: 1,
      });
      const currencyRes = await this.currenciesService.findOne(1);
      const memberPaymentAccess =
        await this.memberPaymentAccessService.getDetails({
          createdBy: member.id,
          paymentMethodId: PAYMENT_METHOD.CARD,
        });
      entities['price'] =
        promotiomProduct['currencyCode'] + ' ' + promotiomProduct?.price;
      entities['promotionExpiredDate'] =
        await this.commonUtilsService.dateFormate(entities.endDate);
      if (
        !memberPaymentAccess.length ||
        !memberPaymentAccess[0].customerId ||
        !memberPaymentAccess[0].paymentMethod ||
        !memberPaymentAccess[0].isActive
      ) {
        this.failedPaymentMail(entities);
      } else {
        const promotionTransaction = await getRepository(OrderTransaction)
          .createQueryBuilder('ot')
          .select('ot.transactionId transactionId')
          .innerJoin('ot.orderproduct', 'op')
          .innerJoin('op.orderProductItem', 'opi')
          .andWhere('opi.stallionPromotionId = :stallionPromotionId', {
            stallionPromotionId: entities.promotionId,
          })
          .orderBy('ot.id', 'DESC')
          .getRawOne();

        const paymentIntent = await this.stripe.charges.retrieve(
          promotionTransaction?.transactionId,
        );
        let shippingAddress = paymentIntent?.shipping?.address;
        const total = promotiomProduct?.price;
        let billingAddress: any = {};
        if (member.memberaddress.length) {
          const memberAddress: any = member.memberaddress[0];
          billingAddress['country'] = memberAddress?.countryName;
          if (memberAddress.address) {
            billingAddress['line1'] = memberAddress.address;
          } else {
            billingAddress['line1'] = shippingAddress.line1;
          }
          if (memberAddress.postcode) {
            billingAddress['postal_code'] = memberAddress.postcode;
          } else {
            billingAddress['postal_code'] = shippingAddress.postal_code;
          }
        } else {
          billingAddress['country'] = shippingAddress.country;
          billingAddress['line1'] = shippingAddress.line1;
          billingAddress['postal_code'] = shippingAddress.postal_code;
        }

        var params = {
          payment_method_types: [paymentMethodRes[0].paymentMethod],
          amount: total,
          currency: currencyRes.currencyCode,
          confirm: true,
          off_session: true,
          customer: memberPaymentAccess[0].customerId,
          payment_method: memberPaymentAccess[0].paymentMethod,
          description: 'Payment for Auto Renew Stallion',
          shipping: {
            name: member.fullName,
            address: billingAddress,
          },
        };

        try {
          const stripe = require('stripe')(
            `${this.configService.get('app.stripeSecretKey')}`,
          );
          const paymentIntent = await stripe.paymentIntents.create(params);
          const charge = await stripe.charges.retrieve(
            paymentIntent.latest_charge,
          );
          if (paymentIntent && charge) {
            if (charge.paid == true) {
              const createTransactionDto = new CreateTransactionDto();
              createTransactionDto.createdBy =
                member && member.id ? member.id : null;
              // createTransactionDto.discount = discount;
              createTransactionDto.total = total;
              createTransactionDto.subTotal = total;
              createTransactionDto.status = charge.status;
              createTransactionDto.paymentStatus =
                charge.paid == true
                  ? PAYMENT_STATUS.PAID
                  : PAYMENT_STATUS.UNPAID;
              createTransactionDto.memberId =
                member && member.id ? member.id : null;
              createTransactionDto.mode = paymentMethodRes[0].paymentMethod;
              createTransactionDto.paymentMethod = PAYMENT_METHOD.CARD;
              createTransactionDto.orderId = 0;
              createTransactionDto.receiptUrl = charge.receipt_url;
              createTransactionDto.transactionId = charge.id;

              // const record = await this.orderTransactionRepository.save(
              //   this.orderTransactionRepository.create(createTransactionDto),
              // );
              this.updatePromotion(entities, member);
            } else {
              this.failedPaymentMail(entities);
            }
          }
          return charge;
        } catch (err) {
          console.log('-----------------error', err?.raw?.message);
          this.failedPaymentMail(entities);

          return err;
        }
      }
    }
  }

  async updatePromotion(stallion, member) {
    let startDate = new Date();
    let endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + 1);
    endDate = new Date(new Date(endDate).getTime() - 24 * 60 * 60 * 1000);
    const update = getRepository(StallionPromotion).update(
      { id: stallion.promotionId },
      {
        startDate: startDate,
        endDate: endDate,
        expiryDate: endDate,
        promotedCount: parseInt(stallion.promotedCount) + 1,
        modifiedBy: member['id'],
      },
    );
  }

  async failedPaymentMail(stallion) {
    const recipient = await this.membersService.findOne({
      id: stallion.createdBy,
    });
    let mailData = {
      to: recipient.email,
      subject: 'Failed Payment',
      text: '',
      template: '/promoted-failed-payment',
      context: {
        farmAdminName: await this.commonUtilsService.toTitleCase(
          recipient.fullName,
        ),
        stallionName: await this.commonUtilsService.toTitleCase(
          stallion.horseName,
        ),
        rosterUrl:
          process.env.FRONTEND_DOMAIN +
          '/stallion-roster/' +
          stallion.farmName +
          '/' +
          stallion.farmId,
        expiredDate: stallion.promotionExpiredDate,
        promotionFee: stallion.price,
      },
    };

    this.mailService.sendMailCommon(mailData);
  }

  async updatePaymentMethodMail(stallion, card) {
    let effectiveDateArr = stallion.endDate.split('-');
    const recipient = await this.membersService.findOne({
      id: stallion.createdBy,
    });
    let mailData = {
      to: recipient.email,
      subject: 'Update Payment Method',
      text: '',
      template: '/update-payment-method',
      context: {
        farmAdminName: await this.commonUtilsService.toTitleCase(
          recipient.fullName,
        ),
        rosterUrl:
          process.env.FRONTEND_DOMAIN +
          '/stallion-roster/' +
          stallion.farmName +
          '/' +
          stallion.farmId,
        expMonthYear:
          effectiveDateArr[2] +
          '.' +
          effectiveDateArr[1] +
          '.' +
          effectiveDateArr[0],
        brand: card.brand,
        last4: card.last4,
        countryCode: card.country,
        // updateNowLink: process.env.FRONTEND_DOMAIN + messageTemplate.linkAction,
      },
    };

    this.mailService.sendMailCommon(mailData);
  }

  async taxCalculation() {
    try {
      const stripe = new Stripe(
        `${this.configService.get('app.stripeSecretKey')}`,
        { apiVersion: null },
      );
      // const calculation = await stripe.tax.calculations.create({
      //   currency: 'usd',
      //   line_items: [
      //     {
      //       amount: 1000,
      //       reference: 'L1',
      //     },
      //   ],
      //   customer_details: {
      //     address: {
      //       line1: '920 5th Ave',
      //       city: 'Seattle',
      //       state: 'WA',
      //       postal_code: '98104',
      //       country: 'US',
      //     },
      //     address_source: 'shipping',
      //   },
      //   expand: ['line_items.data.tax_breakdown'],
      // });
    } catch (err) {
      console.log('Error ==========', err);
    }
    return '';
  }

  async findAllTest(
    searchOptionsDto: PageOptionsDto,
  ): Promise<PageDto<OrderTransaction>> {
    const member = this.request.user;
    const queryBuilder = this.orderTransactionRepository
      .createQueryBuilder('orderTransaction')
      .select(
        'orderTransaction.orderId as orderIdNum,orderTransaction.transactionId as orderId, orderTransaction.status, orderTransaction.total as total, orderTransaction.subTotal, orderTransaction.discount, orderTransaction.createdOn as orderCreatedOn, orderTransaction.receiptUrl as receiptUrl, orderTransaction.mode as paymentMode, orderTransaction.payerId, 1 as productDetails, 0 as cardDetails',
      )
      .addSelect(
        'orderProduct.id as opId,orderProduct.price as price, orderProduct.quantity as quantity, orderProduct.pdfLink as reportLink, orderProduct.isLinkActive as isLinkActive',
      )
      .addSelect(
        'product.productName as productName, product.productCode as productCode',
      )
      .addSelect('paymentstatus.statusName as paymentStatus')
      .addSelect('paymentmethod.paymentMethod as paymentMethod')
      .addSelect(
        'promocode.promoCode as promoCode, promocode.discountType as discountType, promocode.price as discountValue',
      )
      .addSelect('orderstatus.status as reportStatus')
      .addSelect('category.categoryName as productCategoryName')
      .addSelect(
        'currency.currencySymbol as currencySymbol, currency.currencyCode as currencyCode',
      )
      .innerJoin('orderTransaction.orderproduct', 'orderProduct')
      .innerJoin('orderTransaction.paymentstatus', 'paymentstatus')
      .innerJoin('orderTransaction.paymentmethod', 'paymentmethod')
      .leftJoin('orderTransaction.promocode', 'promocode')
      .leftJoin('orderProduct.product', 'product')
      .leftJoin('product.category', 'category')
      .leftJoin(
        'orderProduct.orderstatus',
        'orderstatus',
        'orderstatus.id = orderProduct.orderStatusId',
      )
      .innerJoin('orderProduct.order', 'order')
      .leftJoin('order.currency', 'currency')
      .innerJoin('order.country', 'country')
      .andWhere('orderTransaction.createdBy=:memberId', {
        memberId: member['id'],
      })
      .orderBy('orderTransaction.id', searchOptionsDto.order)
      .offset(searchOptionsDto.skip)
      .limit(searchOptionsDto.limit);

    const entities = await queryBuilder.getRawMany();

    const itemCount = await queryBuilder.getCount();
    await entities.reduce(async (promise, item) => {
      await promise;

      const sQueryBuilder = getRepository(OrderProductItem)
        .createQueryBuilder('opi')
        .select('opi.mareId as mareId, opi.stallionId as stallionId');

      if (
        item.productCode == 'REPORT_STALLION_AFFINITY' ||
        item.productCode == 'PROMOTION_STALLION'
      ) {
        sQueryBuilder
          .addSelect('horse.horseName as horseName')
          .innerJoin('opi.stallion', 'stallion')
          .innerJoin('stallion.horse', 'horse');
      } else {
        sQueryBuilder
          .addSelect('mare.horseName as horseName')
          .innerJoin('opi.horse', 'mare');
      }
      sQueryBuilder.andWhere('opi.orderProductId = :orderProduct', {
        orderProduct: item.opId,
      });

      const itemInfo = await sQueryBuilder.getRawOne();

      delete item.opId;
      if (itemInfo) {
        item.horseName = itemInfo?.horseName;
      }
      item['downloadStatus'] = await this.isDownloadable([item]);
    }, Promise.resolve());
    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: searchOptionsDto,
    });
    return new PageDto(entities, pageMetaDto);
  }

  // Get details for invoice
  async getInvoiceDetails(
    sessionId: string,
  ): Promise<PageDto<OrderTransaction>> {
    const member = this.request.user;

    const queryBuilder = this.orderTransactionRepository
      .createQueryBuilder('orderTransaction')
      .select(
        'orderTransaction.orderId as orderIdNum,orderTransaction.transactionId as orderId, orderTransaction.status, orderTransaction.total as total, orderTransaction.subTotal, orderTransaction.discount, orderTransaction.createdOn as orderCreatedOn, orderTransaction.receiptUrl as receiptUrl, orderTransaction.mode as paymentMode, orderTransaction.payerId, orderTransaction.taxValue, orderTransaction.taxPercent as taxPercentage, 1 as productDetails, 0 as cardDetails',
      )
      .addSelect('paymentstatus.statusName as paymentStatus')
      .addSelect('paymentmethod.paymentMethod as paymentMethod')
      .addSelect(
        'promocode.promoCode as promoCode, promocode.discountType as discountType, promocode.price as discountValue',
      )
      .innerJoin('orderTransaction.paymentstatus', 'paymentstatus')
      .innerJoin('orderTransaction.paymentmethod', 'paymentmethod')
      .leftJoin('orderTransaction.promocode', 'promocode')
      .andWhere('orderTransaction.transactionId = :transactionId', {
        transactionId: sessionId,
      })
      .andWhere('orderTransaction.createdBy = :memberId', {
        memberId: member['id'],
      });

    const entities = await queryBuilder.getRawOne();

    if (entities) {
      const subQueryBuilder = getRepository(OrderProduct)
        .createQueryBuilder('orderProduct')
        .select(
          'orderProduct.id as opId, orderProduct.price as price, orderProduct.quantity as quantity, orderProduct.pdfLink as reportLink, orderProduct.isLinkActive as isLinkActive',
        )
        .addSelect(
          'product.productName as productName,product.productCode as productCode',
        )
        .addSelect(
          'currency.currencySymbol as currencySymbol, currency.currencyCode as currencyCode',
        )
        .addSelect('category.categoryName as productCategoryName')
        .addSelect('orderstatus.status as reportStatus')
        .leftJoin('orderProduct.order', 'order')
        .leftJoin(
          'orderProduct.orderstatus',
          'orderstatus',
          'orderstatus.id = orderProduct.orderStatusId',
        )
        .leftJoin('order.currency', 'currency')
        .leftJoin('orderProduct.product', 'product')
        .leftJoin('product.category', 'category')
        .andWhere('orderProduct.orderId=:orderId', {
          orderId: entities.orderIdNum,
        });
      const subEntities = await subQueryBuilder.getRawMany();

      await subEntities.reduce(async (promise, item) => {
        await promise;

        const sQueryBuilder = getRepository(OrderProductItem)
          .createQueryBuilder('opi')
          .select('opi.mareId as mareId, opi.stallionId as stallionId');

        if (
          item.productCode == 'REPORT_STALLION_AFFINITY' ||
          item.productCode == 'PROMOTION_STALLION'
        ) {
          sQueryBuilder
            .addSelect('horse.horseName as horseName')
            .innerJoin('opi.stallion', 'stallion')
            .innerJoin('stallion.horse', 'horse');
        } else {
          sQueryBuilder
            .addSelect('mare.horseName as horseName')
            .innerJoin('opi.horse', 'mare');
        }
        sQueryBuilder.andWhere('opi.orderProductId = :orderProduct', {
          orderProduct: item.opId,
        });

        const itemInfo = await sQueryBuilder.getRawOne();

        delete item.opId;
        if (itemInfo) {
          item.horseName = itemInfo?.horseName;
        }
      }, Promise.resolve());

      entities.productDetails = subEntities;
      // entities.downloadStatus = await this.isDownloadable(subEntities);

      if (entities.paymentMode.trim() == 'card') {
        let cardDetails = await this.ordersService.getMaskedCardNumber(
          entities.orderId,
        );
        entities.cardDetails = {
          brand: cardDetails.brand,
          last4: cardDetails.last4,
        };
      }
    }

    return entities;
  }
  async closeNomination(stallionId) {
    const recordResopnse = await getRepository(StallionNomination).findOne({
      stallionId: stallionId,
    });
    let numNom = recordResopnse.noOfNominations - 1;
    const Resopnse = await getRepository(StallionNomination).update(
      { stallionId: stallionId },
      { noOfNominations: numNom },
    );
  }
  async promocodeRedemption(coupon) {
    const recordResopnse = await getRepository(PromoCode).findOne({
      id: coupon,
    });
    let numNom = recordResopnse.redemtions - 1;
    const Resopnse = await getRepository(PromoCode).update(
      { id: coupon },
      { redemtions: numNom },
    );
  }

  async expiryCardReminder(customerId) {
    let entities = await getRepository(MemberPaytypeAccess)
      .createQueryBuilder('mpa')
      .select('mpa.createdBy, mpa.customerId, mpa.paymentMethod')
      .addSelect('member.email as email, member.fullName as fullName')
      .innerJoin('mpa.member', 'member')
      .andWhere('mpa.isActive = 1')
      .andWhere('mpa.paymentMethodId = 1')
      .andWhere('mpa.customerId = :customerId', { customerId: customerId })
      .andWhere('mpa.paymentMethod IS NOT NULL')
      .andWhere("mpa.paymentMethod != ''")
      .getRawMany();
    console.log('=================entities', entities);
    if (entities && entities.length > 0) {
      entities.forEach(async (item) => {
        let paymentMethods = await stripe.paymentMethods.list({
          customer: item.customerId,
          type: 'card',
        });
        if (paymentMethods && paymentMethods.data.length > 0) {
          item.card = paymentMethods.data[0].card;
          let d = new Date();
          console.log(
            paymentMethods.data[0].card.exp_month,
            d.getMonth() + 1,
            paymentMethods.data[0].card.exp_year,
            d.getFullYear(),
          );

          if (
            paymentMethods.data[0].card.exp_month == d.getMonth() + 1 &&
            paymentMethods.data[0].card.exp_year == d.getFullYear()
          )
            this.sendCardExpiryMail(item);
        }
      });
    }
  }

  async sendCardExpiryMail(data) {
    const messageTemplate = await this.getMessageTemplateByUuid(
      notificationTemplates.UpdatePaymentMethod,
    );
    const messageTitle = messageTemplate.messageTitle;
    if (messageTemplate.emailSms) {
      const preferedNotification =
        await this.getPreferredNotificationByNotificationTypeCode(
          notificationType.SYSTEM_NOTIFICATIONS,
          data.createdBy,
        );

      if (
        (!preferedNotification || preferedNotification.isActive) &&
        data.card
      ) {
        let mailData = {
          to: data.email,
          subject: messageTitle,
          text: '',
          template: '/update-payment-method',
          context: {
            userName: await this.commonUtilsService.toTitleCase(data.fullName),
            brand: data.card.brand,
            expMonthYear: data.card.exp_month + '/' + data.card.exp_year, //21 April, 2022
            last4: data.card.last4,
            countryCode: data.card.country,
            updateNowLink:
              process.env.FRONTEND_DOMAIN + messageTemplate.linkAction,
          },
        };

        this.mailService.sendMailCommon(mailData);
      }
    }
  }

  async getMessageTemplateByUuid(messageTemplateByUuid) {
    const queryBuilder = getRepository(MessageTemplate)
      .createQueryBuilder('messageTemplate')
      .select(
        'messagetemplate.id as id, messagetemplate.messageTitle, messagetemplate.messageText, messagetemplate.linkName, messagetemplate.msgDescription,messagetemplate.smFrontEnd,messagetemplate.forAdmin,messagetemplate.g1Slack,messagetemplate.breeder,messagetemplate.farmAdmin,messagetemplate.farmUser,messagetemplate.emailSms,farmUser,messagetemplate.linkAction',
      )
      .andWhere('messagetemplate.messageTemplateUuid = :messageTemplateUuid', {
        messageTemplateUuid: messageTemplateByUuid,
      });

    const messageTemplate = await queryBuilder.getRawOne();
    return messageTemplate;
  }

  // To get preferred Notification setted by Member in member profile.
  async getPreferredNotificationByNotificationTypeCode(
    notificationTypeCode: string,
    recipientId: number = null,
  ) {
    let queryBuilder = getRepository(NotificationType)
      .createQueryBuilder('nt')
      .select('nt.id as notificationTypeId');

    if (recipientId) {
      queryBuilder
        .addSelect('preferednotification.isActive as isActive')
        .leftJoin('nt.preferednotification', 'preferednotification')
        .leftJoin('preferednotification.member', 'member')
        .andWhere('member.id = :recipientId', { recipientId: recipientId });
    }

    queryBuilder
      .andWhere('nt.notificationTypeCode = :notificationTypeCode', {
        notificationTypeCode: notificationTypeCode,
      })
      .orderBy('nt.id');

    const preferedNotification = await queryBuilder.getRawOne();
    return preferedNotification;
  }
}
