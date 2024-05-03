import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class GetPromoCodeDto {
  @ApiProperty()
  @IsOptional()
  totalAmount: number;

  @ApiProperty()
  @IsOptional()
  promoCode: string;

  @ApiProperty()
  @IsOptional()
  productIds: Array<number>;

  @ApiProperty()
  @IsOptional()
  memberuuid: string;
}
