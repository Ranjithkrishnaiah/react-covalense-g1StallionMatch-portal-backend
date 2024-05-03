import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PRODUCTCODES } from 'src/utils/constants/products';
import { PricingService } from './pricing.service';

@ApiTags('Pricing')
@Controller({
  path: 'pricing',
  version: '1',
})
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @ApiOperation({
    summary: 'Get Stallion Promotion Price By Country Code',
  })
  @ApiOkResponse({
    description: '',
  })
  @Get(':countryCode/stallion-promotion')
  findAll(@Param('countryCode') countryCode: string) {
    return this.pricingService.getPricing(
      countryCode,
      PRODUCTCODES.PROMOTION_STALLION,
    );
  }
}
