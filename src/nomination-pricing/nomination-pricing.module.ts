import { Module } from '@nestjs/common';
import { NominationPricingController } from './nomination-pricing.controller';
import { NominationPricingService } from './nomination-pricing.service';

@Module({
  controllers: [NominationPricingController],
  providers: [NominationPricingService]
})
export class NominationPricingModule {}
