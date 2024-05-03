import { Inject, Injectable, Scope, UnprocessableEntityException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getRepository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { PageMetaDto } from 'src/utils/dtos/page-meta.dto';
import { PageOptionsDto } from 'src/utils/dtos/page-options.dto';
import { PageDto } from 'src/utils/dtos/page.dto';
import { Order } from './entities/order.entity';
import { OrderDto } from './dto/order.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { CartsService } from 'src/carts/carts.service';
import { OrderProductService } from 'src/order-product/order-product.service';
import { OrderProductItemsService } from 'src/order-product-items/order-product-items.service';
import { CartProductService } from 'src/cart-product/cart-product.service';
import { OrderProductDto } from 'src/order-product/dto/order-product.dto';
import { OrderProductItemDto } from 'src/order-product-items/dto/create-order-product-item.dto';
import { CartProductItemsService } from 'src/cart-product-items/cart-product-items.service';
import { OrderReportService } from 'src/order-report/order-report.service';
import { ReportTemplatesService } from 'src/report-templates/report-templates.service';
import { Stallion } from 'src/stallions/entities/stallion.entity';
import { NotificationsService } from 'src/notifications/notifications.service';
import { MessageTemplatesService } from 'src/message-templates/message-templates.service';
import { MailService } from 'src/mail/mail.service';
import { OrderTransaction } from 'src/order-transaction/entities/order-transaction.entity';
import { Member } from 'src/members/entities/member.entity';
import { ConfigService } from '@nestjs/config';
import { OrderProduct } from 'src/order-product/entities/order-product.entity';
import { MarketingAdditionInfoMedia } from 'src/marketing-addition-info-media/entities/marketing-addition-info-media.entity';
import { OrderProductItem } from 'src/order-product-items/entities/order-product-item.entity';
import { BoostProfileService } from 'src/boost-profile/boost-profile.service';
import { ProductsService } from 'src/products/products.service';
import { PRODUCTCODES } from 'src/utils/constants/products';
import { notificationTemplates } from 'src/utils/constants/notifications';
import { OrderStatusService } from 'src/order-status/order-status.service';
import { ordersStatusList } from 'src/utils/constants/orders-status';
import { boostTypes } from 'src/utils/constants/messaging';
import Stripe from 'stripe';
import { CommonUtilsService } from 'src/common-utils/common-utils.service';
import { ReportProductItemsService } from 'src/report-product-items/report-product-items.service';
import { AdminPageSettings } from 'src/admin-page-settings/entities/admin-page-setting.entity';
import { PAYMENT_METHOD, PAYMENT_METHOD_TEXT } from 'src/utils/constants/common';

@Injectable({ scope: Scope.REQUEST })
export class OrdersService {
  private readonly stripe: Stripe;
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    private orderProductService: OrderProductService,
    private orderProductItemService: OrderProductItemsService,
    private cartsService: CartsService,
    private cartProductService: CartProductService,
    private cartProductItemService: CartProductItemsService,
    private orderReportService: OrderReportService,
    private reportTemplatesService: ReportTemplatesService,
    private notificationsService: NotificationsService,
    private messageTemplatesService: MessageTemplatesService,
    private mailService: MailService,
    private boostProfileService: BoostProfileService,
    readonly configService: ConfigService,
    readonly productsService: ProductsService,
    readonly orderStatusService: OrderStatusService,
    private commonUtilsService: CommonUtilsService,
    private reportProductItemsService: ReportProductItemsService,
    ) { 

    this.stripe = new Stripe(`${this.configService.get('app.stripeSecretKey')}`, {
      apiVersion: null,
    });
  }

  //to create new order if payment got success for all products
  async create(createOrderDto: CreateOrderDto) {
    const { sessionId, items, currencyId, fullName, email, countryId, postalCode, createdBy, memberId } = createOrderDto;

    let orderData = new Order();
    orderData.sessionId = sessionId
    orderData.currencyId = currencyId;
    orderData.fullName = fullName;
    orderData.email = email;
    orderData.countryId = countryId;
    orderData.postalCode = postalCode;
    orderData.memberId = memberId
    orderData.createdBy = createdBy

    const createOrderResponse = await this.orderRepository.save(
      this.orderRepository.create(orderData),
    );

    await items.forEach(async (item) => {
      let mareId, stallions = [], stallionId, locations = [], boostProfileId, promotionId;
      let cartRecord = await this.cartsService.findOne({ cartSessionId: item.cartId });
      if (!cartRecord || cartRecord.length == 0) {
        throw new NotFoundException('Not exist!');
      }

      let cartProduct = await this.cartProductService.findByCartId(cartRecord[0].id);
      if (!cartProduct) {
        throw new NotFoundException('Not exist!');
      }

      const orderStatus = await this.orderStatusService.findOneByStatusCode(ordersStatusList.ORDERED);

      const orderProductData = new OrderProductDto();
      orderProductData.orderId = createOrderResponse['id'];
      orderProductData.productId = cartProduct[0].productId;
      orderProductData.price = cartProduct[0].price;
      orderProductData.quantity = cartProduct[0].quantity;
      orderProductData.createdBy = createdBy;
      orderProductData.orderStatusId = orderStatus?.id;
      orderProductData.selectedPriceRange = cartProduct[0].selectedpriceRange;

      const update = await this.orderRepository.update({ id: createOrderResponse['id'] }, { total: cartProduct[0].price });

      const createOrderProductResponse = await this.orderProductService.create(orderProductData);
      if (createOrderProductResponse) {
        this.orderReportService.create({
          orderProductId: createOrderProductResponse.id,
          createdBy: createdBy,
          orderStatusId: orderStatus?.id,
        })
      }
      let cartProductItem: any = await this.cartProductItemService.findByCartProductItems({ cartProductId: cartProduct[0].id });
      if (!cartProductItem) {
        throw new NotFoundException('Not exist!');
      }
      await this.removeCartItemsByCartId(item.cartId);

      await cartProductItem.reduce(async (promise, element) => {
        await promise;
        const orderProductItemData = new OrderProductItemDto();
        orderProductItemData.orderProductId = createOrderProductResponse['id'];
        orderProductItemData.stallionId = element.stallionId;
        orderProductItemData.farmId = element.farmId;
        orderProductItemData.mareId = element.mareId;
        orderProductItemData.stallionPromotionId = element.stallionPromotionId;
        orderProductItemData.stallionNominationId = element.stallionNominationId;
        orderProductItemData.createdBy = element.createdBy;
        orderProductItemData.commonList = element.commonList;
        orderProductItemData.sales = element.sales;
        orderProductItemData.lotId = element.lotId;
        orderProductItemData.boostProfileId = element.boostProfileId;
        mareId = element.mareId
        stallionId = element.stallionId;
        locations = element.commonList ? element.commonList.split(',') : [];
        stallions.push(element.stallionId)
        boostProfileId = element.boostProfileId
        promotionId = element.stallionPromotionId
        await this.orderProductItemService.create(orderProductItemData);
        await this.reportProductItemsService.create(orderProductItemData);

      }, Promise.resolve());

      let paymentMethod = PAYMENT_METHOD_TEXT.PAYPAL;
      const product = await this.productsService.findOne({ id: cartProduct[0].productId });
      const transaction = await getRepository(OrderTransaction).createQueryBuilder('ot')
        .select('ot.paymentMethod as paymentMethod')
        .andWhere('ot.orderId = :orderId AND ot.transactionId = :transactionId',
          { orderId: createOrderResponse['id'],  transactionId: sessionId})
        .getRawOne();
    
      if(parseInt(transaction?.paymentMethod) === PAYMENT_METHOD.CARD){
        const cardDetails = await this.getMaskedCardNumber(sessionId);
        paymentMethod = await this.commonUtilsService.toTitleCase(cardDetails.brand + ' Ending ****' + cardDetails.last4)
      }
      const autoApprove = await getRepository(AdminPageSettings).findOne({ moduleId: 8 });
      const settings = JSON.parse(autoApprove.settingsResponse);

      if (product?.productCode == PRODUCTCODES.REPORT_SHORTLIST_STALLION) {
        if(settings['approvalAutomation'] === 1){
        await this.shortlistStallionReportApproval({ orderProductId: createOrderProductResponse.id, createdBy, mareId, stallions, fullName, email, paymentMethod })
        }
      }
      if (product?.productCode == PRODUCTCODES.REPORT_STALLION_MATCH_PRO) {
         if(settings['approvalAutomation'] === 1){
        await this.stallionMatchProReportApproval({ orderProductId: createOrderProductResponse.id, createdBy, mareId, stallions, fullName, email, paymentMethod })
        }
      }
      if (product?.productCode == PRODUCTCODES.REPORT_BROODMARE_AFFINITY) {
         if(settings['approvalAutomation'] === 1){
        await this.broodmareAfinityReportApproval({ orderProductId: createOrderProductResponse.id, createdBy, mareId, countryId, fullName, email, paymentMethod })
        }
      }
      if (product?.productCode == PRODUCTCODES.REPORT_STALLION_MATCH_SALES) {
         if(settings['approvalAutomation'] === 1){
        await this.salesCatelogueReportApproval({ orderProductId: createOrderProductResponse.id, createdBy, fullName, email, paymentMethod })
        }
      }
      if (product?.productCode == PRODUCTCODES.REPORT_STALLION_BREEDING_STOCK_SALE) {
         if(settings['approvalAutomation'] === 1){
        await this.stallionBreedingStockSaleReportApproval({ orderProductId: createOrderProductResponse.id, createdBy, fullName, email, paymentMethod })
        } 
      }
      if (product?.productCode == PRODUCTCODES.REPORT_STALLION_AFFINITY) {
         if(settings['approvalAutomation'] === 1){
        await this.stallionAfinityReportApproval({ orderProductId: createOrderProductResponse.id, createdBy, stallionId, fullName, email, paymentMethod })
        }
      }
      if (product?.productCode == PRODUCTCODES.REPORT_BROODMARE_SIRE) {
         if(settings['approvalAutomation'] === 1){
        await this.broodMareSireReportApproval({ orderProductId: createOrderProductResponse.id, createdBy, mareId, locations, fullName, email, paymentMethod })
        }
      }
      if (product?.productCode == PRODUCTCODES.BOOST_LOCAL) {
        await this.boostProfileService.sendBoostNotification(boostProfileId, boostTypes.LOCAL_BOOST, createdBy, fullName, email)
      }
      if (product?.productCode == PRODUCTCODES.BOOST_EXTENDED) {
        await this.boostProfileService.sendBoostNotification(boostProfileId, boostTypes.EXTENDED_BOOST, createdBy, fullName, email)
      }
      if (product?.productCode == PRODUCTCODES.PROMOTION_STALLION) {
        await this.boostProfileService.sendBoostNotificationWhenStallionPromotes({ promotionId, boostType: boostTypes.LOCAL_BOOST, createdBy, fullName, email })
      }
    })
    return createOrderResponse;


  }

  //getting orders list of logginin member 
  async findAll(
    searchOptionsDto: PageOptionsDto
  ) {
    const member = this.request.user;

    const queryBuilder = this.orderRepository.createQueryBuilder("order")
      .select('order.sessionId as orderId, order.total as total')
      .addSelect('orderProduct.price as productPrice,orderProduct.quantity as quntity')
      .leftJoin('order.orderProduct', 'orderProduct')
      .andWhere("order.createdBy=:memberId", { memberId: member['id'] })

    queryBuilder
      .orderBy("order.id", searchOptionsDto.order)
      .offset(searchOptionsDto.skip)
      .limit(searchOptionsDto.limit);

    const itemCount = await queryBuilder.getCount();
    const entities = await queryBuilder.getRawMany();

    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto: searchOptionsDto });

    return new PageDto(entities, pageMetaDto);
  }

  //getting single order details
  async findOne(feilds) {
    return await this.orderRepository.find({
      where: feilds
    });
  }

  // deleting the order based on its id
  async delete(id: number) {
    const record = await this.orderRepository.findOne({ id: id });
    if (!record) {
      throw new UnprocessableEntityException('Cart Product not exist!');
    }
    const response = await this.orderRepository.delete(id);
    return response;

  }

  // updating order details based on its id
  async update(id: number, orderDto: OrderDto) {
    return this.orderRepository.update({ id: id }, orderDto);
  }

  //deleting cart items based on member id
  async removeCartItems(createdUserId) {
    let cartRecords = await this.cartsService.findOne({ email: createdUserId });
    cartRecords.forEach(async (item) => {
      let cartProduct = await this.cartProductService.findByCartId(item.id);
      let cartProductItem: any = await this.cartProductItemService.findByCartProductItems({ cartProductId: cartProduct[0].id });
      let ids = [];

      cartProductItem.forEach(async element => {
        ids.push(element.id);
      });

      if (ids.length > 0) {
        await this.cartProductItemService.deleteMany(ids);
      }

      await this.cartProductService.delete(cartProduct[0].id);
      await this.cartsService.deleteById({ cartId: item.id });

    })
    return 'deleted successfully';
  }

  //deleting cart items based on cart id
  async removeCartItemsByCartId(cartSessionId) {
    let cartRecord = await this.cartsService.findOne({ cartSessionId: cartSessionId });
    cartRecord.forEach(async (item) => {
      let cartProduct = await this.cartProductService.findByCartId(item.id);
      let cartProductItem: any = await this.cartProductItemService.findByCartProductItems({ cartProductId: cartProduct[0].id });
      let ids = [];

      cartProductItem.forEach(async element => {
        ids.push(element.id);
      });

      if (ids.length > 0) {
        await this.cartProductItemService.deleteMany(ids);
      }

      await this.cartProductService.delete(cartProduct[0].id);
      await this.cartsService.deleteById({ cartId: item.id });

    })
    return 'deleted successfully';
  }

  // functionality for approval of broodMareSireReport
  async broodMareSireReportApproval(orderDto) {
    const { locations, mareId, orderProductId, createdBy, fullName, email, paymentMethod } = orderDto;
    const orderStatus = await this.orderStatusService.findOneByStatusCode(ordersStatusList.INITIATED);

    await this.orderProductService.update({ id: orderProductId }, { orderStatusId: orderStatus?.id, modifiedBy: createdBy, modifiedOn: new Date() })
    await this.createOrderStatus(orderProductId, createdBy, 2)

    let stallionIds = [];
    const stallionsByLocation = await getRepository(Stallion).createQueryBuilder("stallion")
      .select('stallion.id as id')
      .innerJoin('stallion.stallionlocation', 'stallionlocation')
      .andWhere("stallionlocation.countryId IN (:...countryIds)", { 'countryIds': locations })
      .getRawMany()

    stallionIds = await Promise.all(stallionsByLocation.map(async element => {
      return element.id;
    }))
    if (stallionIds.length > 4) {
      stallionIds = stallionIds.slice(0, 3);
    }

    let getLink = await this.reportTemplatesService.generateBroodMareSireReport(mareId, stallionIds, [], fullName, email)

    if (getLink) {
      const orderStatus = await this.orderStatusService.findOneByStatusCode(ordersStatusList.COMPLETED);

      let orderResponse = await this.orderProductService.update({ id: orderProductId }, { orderStatusId: orderStatus?.id, pdfLink: getLink, isLinkActive: true, modifiedBy: createdBy, modifiedOn: new Date() })
      if (orderResponse) {
        await this.createOrderStatus(orderProductId, createdBy, orderStatus?.id)
        const reportSettings = await this.getReportDeliverySettings()
        if(reportSettings === 1 ){
        await this.sendReport(orderProductId, createdBy, paymentMethod);
        }
      }
    }
  }

  // functionality for approval of broodmareAfinityReportApproval
  async broodmareAfinityReportApproval(orderDto) {

    const { mareId, orderProductId, createdBy, countryId, fullName, email, paymentMethod } = orderDto;
    const orderStatus = await this.orderStatusService.findOneByStatusCode(ordersStatusList.INITIATED);

    await this.orderProductService.update({ id: orderProductId }, { orderStatusId: orderStatus?.id, modifiedBy: createdBy, modifiedOn: new Date() })
    await this.createOrderStatus(orderProductId, createdBy, orderStatus?.id)
    let getLink = await this.reportTemplatesService.generateBroodmareAffinityReport(mareId, countryId, [], fullName, email)
    if (getLink) {
      const orderStatus = await this.orderStatusService.findOneByStatusCode(ordersStatusList.COMPLETED);
      let orderResponse = await this.orderProductService.update({ id: orderProductId }, { orderStatusId: orderStatus?.id, pdfLink: getLink, isLinkActive: true, modifiedBy: createdBy, modifiedOn: new Date() })
      if (orderResponse) {
        await this.createOrderStatus(orderProductId, createdBy, orderStatus?.id)
        const reportSettings = await this.getReportDeliverySettings()
        if(reportSettings === 1 ){
        await this.sendReport(orderProductId, createdBy, paymentMethod);
        }
      }
    }
  }

  // functionality for approval of stallionAfinityReportApproval
  async stallionAfinityReportApproval(orderDto) {
    const { orderProductId, createdBy, stallionId, fullName, email, paymentMethod } = orderDto;
    const orderStatus = await this.orderStatusService.findOneByStatusCode(ordersStatusList.INITIATED);
    await this.orderProductService.update({ id: orderProductId }, { orderStatusId: orderStatus?.id, modifiedBy: createdBy, modifiedOn: new Date() })
    await this.createOrderStatus(orderProductId, createdBy, 2)
    let getLink = await this.reportTemplatesService.generateStallionAffinityReport(stallionId, [], fullName, email)
    if (getLink) {
      const orderStatus = await this.orderStatusService.findOneByStatusCode(ordersStatusList.COMPLETED);
      let orderResponse = await this.orderProductService.update({ id: orderProductId }, { orderStatusId: orderStatus?.id, pdfLink: getLink, isLinkActive: true, modifiedBy: createdBy, modifiedOn: new Date() })
      if (orderResponse) {
        await this.createOrderStatus(orderProductId, createdBy, orderStatus?.id)
        const reportSettings = await this.getReportDeliverySettings()
        if(reportSettings === 1 ){
        await this.sendReport(orderProductId, createdBy, paymentMethod);
        }
      }

    }
  }

  // functionality for approval of shortlistStallionReportApproval 
  async shortlistStallionReportApproval(orderDto) {
    const { orderProductId, createdBy, mareId, stallions, fullName, email, paymentMethod } = orderDto;
    const orderStatus = await this.orderStatusService.findOneByStatusCode(ordersStatusList.INITIATED);
    await this.orderProductService.update({ id: orderProductId }, { orderStatusId: orderStatus?.id, modifiedBy: createdBy, modifiedOn: new Date() })
    await this.createOrderStatus(orderProductId, createdBy, orderStatus?.id)
    let stallionIds = []
    const stallionsByUuids = await getRepository(Stallion).createQueryBuilder("stallion")
      .select('stallion.id as id')
      .andWhere("stallion.id IN (:...stallionIds)", { 'stallionIds': stallions })
      .getRawMany()

    stallionIds = await Promise.all(stallionsByUuids.map(async element => {
      return element.id;
    }))

    let getLink = await this.reportTemplatesService.generateStallionMatchShortlistReport(mareId, stallionIds, [], fullName, email)
    if (getLink) {

      const orderStatus = await this.orderStatusService.findOneByStatusCode(ordersStatusList.COMPLETED);
      let orderResponse = await this.orderProductService.update({ id: orderProductId }, { orderStatusId: orderStatus?.id, pdfLink: getLink, isLinkActive: true, modifiedBy: createdBy, modifiedOn: new Date() })
      if (orderResponse) {
        await this.createOrderStatus(orderProductId, createdBy, orderStatus?.id)
        const reportSettings = await this.getReportDeliverySettings()
        if(reportSettings === 1 ){
        await this.sendReport(orderProductId, createdBy, paymentMethod);
        }
      }

    }
  }

  // functionality for approval of stallionMatchProReportApproval
  async stallionMatchProReportApproval(orderDto) {
    const { orderProductId, createdBy, stallions, mareId, fullName, email, paymentMethod } = orderDto;
    const orderStatus = await this.orderStatusService.findOneByStatusCode(ordersStatusList.INITIATED);
    await this.orderProductService.update({ id: orderProductId }, { orderStatusId: orderStatus?.id, modifiedBy: createdBy, modifiedOn: new Date() })
    await this.createOrderStatus(orderProductId, createdBy, orderStatus?.id)
    let stallionIds = []
    const stallionsByUuids = await getRepository(Stallion).createQueryBuilder("stallion")
      .select('stallion.id as id')
      .andWhere("stallion.id IN (:...stallionIds)", { 'stallionIds': stallions })
      .getRawMany()

    stallionIds = await Promise.all(stallionsByUuids.map(async element => {
      return element.id;
    }))

    let getLink = await this.reportTemplatesService.generateStallionMatchProReport(mareId, stallionIds, [], fullName, email)
    if (getLink) {
      const orderStatus = await this.orderStatusService.findOneByStatusCode(ordersStatusList.COMPLETED);
      let orderResponse = await this.orderProductService.update({ id: orderProductId }, { orderStatusId: orderStatus?.id, pdfLink: getLink, isLinkActive: true, modifiedBy: createdBy, modifiedOn: new Date() })
      if (orderResponse) {
        await this.createOrderStatus(orderProductId, createdBy, orderStatus?.id)
        const reportSettings = await this.getReportDeliverySettings()
        if(reportSettings === 1 ){
        await this.sendReport(orderProductId, createdBy, paymentMethod);
        }
      }

    }
  }

  // functionality for approval of salesCatelogueReportApproval
  async salesCatelogueReportApproval(orderDto) {
    const { orderProductId, createdBy, fullName, email, paymentMethod } = orderDto;
    const orderStatus = await this.orderStatusService.findOneByStatusCode(ordersStatusList.INITIATED);
    await this.orderProductService.update({ id: orderProductId }, { orderStatusId: orderStatus?.id, modifiedBy: createdBy, modifiedOn: new Date() })
    await this.createOrderStatus(orderProductId, createdBy, orderStatus?.id)
    let getLink = await this.reportTemplatesService.generateSalesCatelogueReport(orderProductId, fullName, email)
    if (getLink) {
      const orderStatus = await this.orderStatusService.findOneByStatusCode(ordersStatusList.COMPLETED);
      let orderResponse = await this.orderProductService.update({ id: orderProductId }, { orderStatusId: orderStatus?.id, pdfLink: getLink, isLinkActive: true, modifiedBy: createdBy, modifiedOn: new Date() })
      if (orderResponse) {
        await this.createOrderStatus(orderProductId, createdBy, orderStatus?.id)
        const reportSettings = await this.getReportDeliverySettings()
        if(reportSettings === 1 ){
        await this.sendReport(orderProductId, createdBy, paymentMethod);
        }
      }

    }
  }

  // functionality for approval of stallionBreedingStockSaleReportApproval
  async stallionBreedingStockSaleReportApproval(orderDto) {
    const { orderProductId, createdBy, fullName, email, paymentMethod } = orderDto;
    const orderStatus = await this.orderStatusService.findOneByStatusCode(ordersStatusList.INITIATED);
    await this.orderProductService.update({ id: orderProductId }, { orderStatusId: orderStatus?.id, modifiedBy: createdBy, modifiedOn: new Date() })
    await this.createOrderStatus(orderProductId, createdBy, orderStatus?.id)
    let getLink = await this.reportTemplatesService.generateStallionXBreederStockSaleReport(orderProductId, fullName, email)
    if (getLink) {
      const orderStatus = await this.orderStatusService.findOneByStatusCode(ordersStatusList.COMPLETED);
      let orderResponse = await this.orderProductService.update({ id: orderProductId }, { orderStatusId: orderStatus?.id, pdfLink: getLink, isLinkActive: true, modifiedBy: createdBy, modifiedOn: new Date() })
      if (orderResponse) {
        await this.createOrderStatus(orderProductId, createdBy, orderStatus?.id)
        const reportSettings = await this.getReportDeliverySettings()
        if(reportSettings === 1 ){
        await this.sendReport(orderProductId, createdBy, paymentMethod);
        }
      }

    }
  }

  //creating new order status when it got changed
  async createOrderStatus(orderProductId, createdBy, statusId) {
    return await this.orderReportService.create({
      orderProductId: orderProductId,
      createdBy: createdBy,
      orderStatusId: statusId
    })
  }

  //sending mail and notifications at the time of sending report 
  async sendReport(orderProductId: number, createdBy: number, paymentMethod:string = '') {
    const member = this.request.user;
    let productInfo = await this.findDetailOne(orderProductId);
    productInfo['paymentMethod'] = paymentMethod;
    const orderStatus = await this.orderStatusService.findOneByStatusCode(ordersStatusList.COMPLETED);
    productInfo['status'] = orderStatus?.status;

    if (productInfo) {
      let result = await this.mailService.sendReport({
        to: productInfo.email,
        data: productInfo,
      });
      if (result && result.messageId) {
        const orderStatus = await this.orderStatusService.findOneByStatusCode(ordersStatusList.DELIVERED);
        await this.orderProductService.update({ id: orderProductId }, { orderStatusId: orderStatus?.id, modifiedBy: createdBy, modifiedOn: new Date() })
        await this.orderReportService.create({
          orderProductId: orderProductId,
          createdBy: createdBy,
          orderStatusId: orderStatus?.id
        })

        const messageTemplate = await this.messageTemplatesService.getMessageTemplateByUuid(notificationTemplates.orderDevilvery)
        const messageText = messageTemplate.messageText.replace('{reportName}',productInfo?.productName); 
        const messageTitle = messageTemplate.messageTitle;
        const notification = this.notificationsService.create({
          createdBy: createdBy,
          messageTemplateId: messageTemplate?.id,
          notificationShortUrl: 'notificationShortUrl',
          recipientId: productInfo?.createdBy,
          messageTitle,
          messageText,
          actionUrl: productInfo?.reportLink,
          isRead: false
        });

        const supperAdminRoleId = this.configService.get('file.supperAdminRoleId');
        const admins = await getRepository(Member).find({ roleId: supperAdminRoleId });
        admins.forEach(async (recipient) => {
          const notificationToAdmin = this.notificationsService.create({
            createdBy: createdBy,
            messageTemplateId: messageTemplate?.id,
            notificationShortUrl: 'notificationShortUrl',
            recipientId: recipient.id,
            messageTitle,
            messageText,
            isRead: false
          });
        })
        return { message: "Mail Sent Successfully" };
      }
      else { return { message: "Something went wrong" }; }
    }
    else {
      return { message: "Failed" };
    }

  }

  //get complete order details based on order product id
  async findDetailOne(id: number) {
    const queryBuilder = getRepository(OrderTransaction).createQueryBuilder("orderTransaction")
      .select('DISTINCT(orderTransaction.id) as orderTransactionId, orderTransaction.paymentIntent as paymentIntent,orderTransaction.mode as paymentMode, orderTransaction.status as transactionStatus,orderTransaction.total as total,orderTransaction.subTotal as subTotal,orderTransaction.discount as discount, orderTransaction.createdOn as orderCreatedOn, 0 as tax,orderTransaction.createdBy,COALESCE(orderTransaction.taxValue, 0) as taxValue,orderTransaction.taxPercent as taxPercentage')
      .addSelect('paymentstatus.statusName as paymentStatus')
      .addSelect('product.id as productId, product.productName as productName')
      .addSelect('paymentmethod.paymentMethod as paymentMethod')
      .addSelect('order.id as orderId, order.fullName as clientName, order.email as email')
      .addSelect('country.countryCode as countryCode')
      .addSelect('currency.currencyCode as currencyCode, currency.currencySymbol as currencySymbol')
      .addSelect('orderStatus.status as status, orderReportStatus.createdOn as statusTime')
      .addSelect('coupon.promoCode as promoCode, coupon.discountType as discountType, coupon.price as couponPrice')
      .addSelect('orderproduct.quantity as noOfStallions, orderproduct.orderProductUuid as orderProductId, orderproduct.pdfLink as reportLink, orderproduct.isLinkActive as isLinkActive')
      .leftJoin('orderTransaction.paymentstatus', 'paymentstatus')
      .leftJoin('orderTransaction.paymentmethod', 'paymentmethod')
      .leftJoin('orderTransaction.orderproduct', 'orderproduct')
      .leftJoin('orderproduct.order', 'order')
      .leftJoin('orderproduct.orderReportStatus', 'orderReportStatus')
      .leftJoin('orderReportStatus.orderStatus', 'orderStatus')
      .leftJoin('order.country', 'country')
      .leftJoin('order.currency', 'currency')
      .leftJoin('orderTransaction.promocode', 'coupon')
      .leftJoin('orderproduct.product', 'product')
      .andWhere('orderproduct.id =:id', { id: id })

    const entity = await queryBuilder.getRawOne();

    if (entity) {
      let pQueryBuilder = await getRepository(OrderProduct).createQueryBuilder('op')
        .select('op.orderProductUuid as orderProductId,op.id orderProductIdNum,op.modifiedOn,op.pdfLink,op.quantity,op.price, null as mediaUrl')
        .addSelect('product.productName as productName,product.productCode,product.marketingPageInfoId marketingPageInfoId')
        .innerJoin('op.product', 'product')
        .andWhere('op.orderId = :orderId', { orderId: entity.orderId })


      let subEntity = await pQueryBuilder.getRawMany()
      let result = await Promise.all(subEntity.map(async (element) => {

        let opiQueryBuilder = await getRepository(OrderProductItem).createQueryBuilder('orderProductItem')
          .addSelect('mare.horseName as mareName')
          .addSelect('horse.horseName as stallionName')
          .addSelect('stallion.id as stallionId')
          .addSelect('stallionPromotion.endDate as expiryDate')
          .leftJoin('orderProductItem.horse', 'mare', 'mare.isVerified=1 AND mare.isActive=1')
          .leftJoin('orderProductItem.stallionPromotion', 'stallionPromotion')
          .leftJoin('orderProductItem.stallion', 'stallion')
          .leftJoin('stallion.horse', 'horse')
          .andWhere('orderProductItem.orderProductId = :orderProductId', { orderProductId: element.orderProductIdNum })
          .getRawOne()

        element.stallionName = opiQueryBuilder?.stallionName
        element.mareName = opiQueryBuilder?.mareName
        element.stallionId = opiQueryBuilder?.stallionId
        element.expiryDate = opiQueryBuilder?.expiryDate
        if (element.marketingPageInfoId) {
          const maiQueryBuilder = await getRepository(MarketingAdditionInfoMedia).createQueryBuilder('maim')
            .select('media.mediaUrl mediaUrl, media.mediaFileType mediaFileType')
            .innerJoin('maim.media', 'media')
            .andWhere('maim.marketingPageAdditionInfoId = :infoId', { infoId: element.marketingPageInfoId })
            .andWhere("media.mediaFileType IN (:...mediaFileTypes)", { mediaFileTypes: ['image/png', 'image/jpeg', 'image/JPG'] })
            .getRawOne()

          element.mediaUrl = maiQueryBuilder?.mediaUrl;
        }
        return element
      }));

      entity['products'] = result;
    }
    return entity;
  }

  // Retrive stripe transaction
  async getMaskedCardNumber(transactionId: string) {
    try {
      const paymentIntent = await this.stripe.charges.retrieve(transactionId);

      return paymentIntent.payment_method_details?.card
    } catch (error) {
      console.error('Error retrieving card details:', error.message);
      throw new Error('Card details not found.');
    }
  }

  async getReportDeliverySettings(){
    const autoApprove = await getRepository(AdminPageSettings).findOne({ moduleId: 8 });
      const settings = JSON.parse(autoApprove.settingsResponse);
      return settings['deliveryAutomation']
  }

}
