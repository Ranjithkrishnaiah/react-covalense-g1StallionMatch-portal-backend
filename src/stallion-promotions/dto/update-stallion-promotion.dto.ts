import { PartialType } from '@nestjs/swagger';
import { CreateStallionPromotionDto } from './create-stallion-promotion.dto';

export class UpdateStallionPromotionDto extends PartialType(
  CreateStallionPromotionDto,
) {
  modifiedBy?: number | null;
  isAutoRenew?: boolean | false;
  stopPromotionCount?: number | 0;
}
