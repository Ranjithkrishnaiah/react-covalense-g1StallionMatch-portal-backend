import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
  Query,
  SetMetadata,
  ParseUUIDPipe,
} from '@nestjs/common';
import { OrderTransactionService } from './order-transaction.service';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from 'src/member-roles/roles.decorator';
import { RoleEnum } from 'src/member-roles/roles.enum';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { RolesGuard } from 'src/member-roles/roles.guard';
import { PageOptionsDto } from 'src/utils/dtos/page-options.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { ApiPaginatedResponse } from 'src/utils/decorators/api-paginated-response.decorator';
import { OrderTransaction } from './entities/order-transaction.entity';
import { PageDto } from 'src/utils/dtos/page.dto';
import { LatestorderResponse } from './dto/larest-order-response.dto';
import { PaypalSuccessDto } from './dto/paypal-success.dto';
import { RoleGuard } from 'src/role/role.gaurd';
import { EstimateTaxDto } from './dto/estimate-tax.dto';

@ApiTags('Order Transactions')
@Controller({
  path: 'order-transactions',
  version: '1',
})
export class OrderTransactionsController {
  constructor(
    private readonly orderTransactionService: OrderTransactionService,
  ) {}

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get All Order Transactions',
  })
  @ApiPaginatedResponse(OrderTransaction)
  @SetMetadata('api', {
    id: 'ORDERTRANSACTIONS_GET',
    method: 'READ',
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get()
  findAll(
    @Query() pageOptionsDto: PageOptionsDto,
  ) {
    return this.orderTransactionService.findAll(pageOptionsDto);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get Order Information by SessionId',
  })
  @UseGuards(JwtAuthenticationGuard)
  @Get('order-info/:sessionId')
  findOrderInfo(@Param('sessionId') sessionId: string) {
    return this.orderTransactionService.findOrderInfo(sessionId);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get Order Details by SessionId',
  })
  @UseGuards(JwtAuthenticationGuard)
  @Get('order-detials/:sessionId')
  findOrderDetails(@Param('sessionId') sessionId: string) {
    return this.orderTransactionService.getOrderDetails(sessionId);
  }

  //Get reports link by sessionId
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get Reports Link of an Order by SessionId',
  })
  @UseGuards(JwtAuthenticationGuard)
  @Get('order-reports-link/:sessionId')
  findReportsLink(@Param('sessionId') sessionId: string) {
    return this.orderTransactionService.getReportsLink(sessionId);
  }

  /* @ApiBearerAuth()
  @ApiOperation({ 
    summary: ' Create Transaction' 
  })
  @ApiCreatedResponse({
    description:'The record has been successfully created.',
  })
  @Roles(RoleEnum.farmadmin, RoleEnum.farmmember, RoleEnum.breeder)
  @UseGuards(JwtAuthenticationGuard, RolesGuard)
  @Post()
  create(@Body() createTransactionDto: CreateTransactionDto) {
    return this.orderTransactionService.create(createTransactionDto);
  } */

  @ApiOperation({
    summary: ' Create Payment Intent',
  })
  @ApiCreatedResponse({
    description: 'The record has been successfully created.',
  })
  /* @SetMetadata('api', {
    id: 'ORDERTRANSACTIONS_CREATE_PAYMENT_INTENT',
    method: 'CREATE',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard, RoleGuard)*/
  @Post('create-payment-intent')
  createPaymentIntent(@Body() createPaymentIntentDto: CreatePaymentIntentDto) {
    return this.orderTransactionService.createPaymentIntent(
      createPaymentIntentDto,
    );
  }

  @ApiOperation({
    summary: ' Create Payment Intent',
  })
  @ApiCreatedResponse({
    description: 'The record has been successfully created.',
  })
  @Post('create-stripe-charge')
  createStripeCharge(@Body() createCheckoutDto: CreateCheckoutDto) {
    return this.orderTransactionService.createStripeCharge(createCheckoutDto);
  }

  @ApiOperation({
    summary: 'Estimate taxes with IP Address',
  })
  @ApiCreatedResponse({
    description: 'Estimate taxes with IP Address',
  })
  @Post('estimate-tax')
  estimateTax(@Body() estimateTaxDto: EstimateTaxDto) {
    return this.orderTransactionService.estimateTax(estimateTaxDto);
  }

  @ApiOperation({
    summary: ' Create Paypal Pay ',
  })
  @ApiCreatedResponse({
    description: 'you will get payment url',
  })
  /* @SetMetadata('api', {
    id: 'ORDERTRANSACTIONS_CREATE_PAYPAL_PAY',
    method: 'CREATE',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard, RoleGuard) */
  @Post('paypal/pay')
  createPaypalPay(@Body() createCheckoutDto: CreateCheckoutDto) {
    return this.orderTransactionService.createPaypalPay(createCheckoutDto);
  }

  @ApiOperation({
    summary: 'Paypal Pay Success',
  })
  @ApiOkResponse({
    description: 'Paypal Pay Success.',
  })
  @Post('paypal/success')
  paypalSuccess(@Body() paypalSuccessDto: PaypalSuccessDto) {
    return this.orderTransactionService.paypalSuccess(paypalSuccessDto);
  }

  @ApiOperation({
    summary: 'Paypal Pay Cancel',
  })
  @ApiOkResponse({
    description: 'Paypal Pay Cancel.',
  })
  @Post('paypal/cancel')
  paypalCancel(@Body() paypalSuccessDto: PaypalSuccessDto) {
    return this.orderTransactionService.paypalCancel(paypalSuccessDto);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: ' Create Checkout',
  })
  @ApiCreatedResponse({
    description: 'The record has been successfully created.',
  })
  /* @Roles(RoleEnum.farmadmin, RoleEnum.farmmember, RoleEnum.breeder)
  @UseGuards(JwtAuthenticationGuard, RolesGuard) */
  @SetMetadata('api', {
    id: 'ORDERTRANSACTIONS_CREATE_CHECKOUT',
    method: 'CREATE',
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Post('checkout')
  checkout(@Body() createCheckoutDto: CreateCheckoutDto) {
    return this.orderTransactionService.checkout(createCheckoutDto);
  }

  @ApiOperation({
    summary: ' Webhook Operation',
  })
  @ApiCreatedResponse({
    description: 'The record has been successfully created.',
  })
  @Post('webhook')
  webhook(@Body() raw: Buffer) {
    return this.orderTransactionService.webhook(raw);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get Latest Order ',
  })
  @ApiOkResponse({
    description: '',
    type: LatestorderResponse,
    isArray: true,
  })
  /* @Roles(RoleEnum.farmadmin, RoleEnum.farmmember, RoleEnum.breeder) *
  @UseGuards(JwtAuthenticationGuard, RolesGuard) 
  @SetMetadata('api', {
    id: 'ORDERTRANSACTIONS_GET_LATEST_ORDER',
    method: 'READ',
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)*/
  @Get('latest-order/:transactionId')
  findLatestOrder(@Param('transactionId') transactionId: string) {
    return this.orderTransactionService.findLatestOrder(transactionId);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create Invoice',
  })
  @ApiCreatedResponse({
    description: 'The record has been successfully created.',
  })
  /* @Roles(RoleEnum.farmadmin, RoleEnum.farmmember, RoleEnum.breeder)
  @UseGuards(JwtAuthenticationGuard, RolesGuard) */
  @SetMetadata('api', {
    id: 'ORDERTRANSACTIONS_CREATE_INVOICE',
    method: 'CREATE',
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Post('create-invoice')
  createInvoice() {
    return this.orderTransactionService.createInvoice();
  }

  @ApiOperation({
    summary: 'Create Invoice',
  })
  @ApiCreatedResponse({
    description: 'The record has been successfully created.',
  })
  @Get('get-invoice')
  getInvoice() {
    return this.orderTransactionService.notifyPaymentCancel(
      'krishnakumari@yopmail.com',
    );
  }

  @ApiOperation({
    summary: 'to send payment cancel notification ',
  })
  @ApiOkResponse({
    description: '',
  })
  @Get('notify-paymentcancel/:emailId')
  notifyPaymentCancel(@Param('emailId') emailId: string) {
    return this.orderTransactionService.notifyPaymentCancel(emailId);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Test auto payment',
  })
  @UseGuards(JwtAuthenticationGuard)
  @Get('test-auto-pay/:stallionId')
  testAutoPay(@Param('stallionId') stallionId: string) {
    return this.orderTransactionService.testAutoPay(stallionId);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get details for invoice',
  })
  @UseGuards(JwtAuthenticationGuard)
  @Get('invoice-details/:sessionId')
  getInvoiceDetails(@Param('sessionId') sessionId: string) {
    return this.orderTransactionService.getInvoiceDetails(sessionId);
  }

  // @ApiOperation({
  //   summary: 'Tax Calculations',
  // })
  // @ApiCreatedResponse({
  //   description: 'Tax Calculations',
  // })
  // @Post('tax-calculations')
  // taxcalculations(@Body() createPaymentIntentDto: CreatePaymentIntentDto) {
  //   return this.orderTransactionService.taxCalculation();
  // }

  
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get All Order Transactions New',
  })
  @ApiPaginatedResponse(OrderTransaction)
  @UseGuards(JwtAuthenticationGuard)
  @Get('new')
  findAllTest(
    @Query() pageOptionsDto: PageOptionsDto,
  ) {
    return this.orderTransactionService.findAllTest(pageOptionsDto);
  }

}
