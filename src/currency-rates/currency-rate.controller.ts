import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrencyRateService } from './currency-rate.service';

@ApiTags('Currency Rates')
@Controller({
  path: 'currency-rates',
  version: '1',
})
export class CurrencyRateController {
  constructor(private readonly currencyRateService: CurrencyRateService) {}
}
