import { Controller } from '@nestjs/common';
import { MarketingAdditionInfoMediaService } from './marketing-addition-info-media.service';

@Controller('marketing-addition-info-media')
export class MarketingAdditionInfoMediaController {
  constructor(
    private readonly marketingAdditionInfoMediaService: MarketingAdditionInfoMediaService,
  ) {}
}
