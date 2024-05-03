import { Controller, Get } from '@nestjs/common';
import { PaymentMethodsService } from './payment-methods.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaymentMethodResponseDto } from './dto/payment-method-response.dto';

@ApiTags('Payment Methods')
@Controller({
  path: 'payment-methods',
  version: '1',
})
export class PaymentMethodsController {
  constructor(private readonly paymentMethodsService: PaymentMethodsService) {}

  @ApiOperation({
    summary: 'Get All Payment Methods',
  })
  @ApiOkResponse({
    description: '',
    type: PaymentMethodResponseDto,
    isArray: true,
  })
  @Get()
  findAll(): Promise<PaymentMethodResponseDto[]> {
    return this.paymentMethodsService.findAll();
  }
}
