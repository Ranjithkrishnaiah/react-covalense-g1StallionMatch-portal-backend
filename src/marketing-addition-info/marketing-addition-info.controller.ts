import { Controller } from '@nestjs/common';
import { MarketingAdditonInfoService } from './marketing-addition-info.service';

@Controller('marketing-addition-info')
export class MarketingAdditonInfoController {
  constructor(
    private readonly marketingAdditonInfoService: MarketingAdditonInfoService,
  ) {}
}
