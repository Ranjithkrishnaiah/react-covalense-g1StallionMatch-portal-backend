import { Controller, Post, Body } from '@nestjs/common';
import { PromoCodeService } from './promo-codes.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetPromoCodeDto } from './dto/get-promo-code.dto';
import { PromoCodeResponseDto } from './dto/promo-code-response.dto';

@ApiTags('Promo Codes')
@Controller({
  path: 'promo-codes',
  version: '1',
})
export class PromoCodesController {
  constructor(private readonly promoCodeService: PromoCodeService) {}

  @ApiOperation({ summary: 'Get Promo Codes - By id' })
  @ApiOkResponse({
    description: '',
    type: PromoCodeResponseDto,
  })
  @Post()
  findOne(@Body() getPromoCodeDto: GetPromoCodeDto) {
    return this.promoCodeService.findOne(getPromoCodeDto);
  }
}
