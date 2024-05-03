import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class CartProductItemDto {
  @ApiProperty()
  @IsNumber()
  cartProductId: number;

  stallionId?: number | null;
  commonList?: string | null;
  farmId?: number | null;
  mareId?: number | null;
  lotId?: number | null;
  boostProfileId?: number | null;
  stallionPromotionId?: number | null;
  stallionNominationId?: number | null;
  sales?: string | null;
  createdBy?: number | null;
}
