import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class CartDto {
  @ApiProperty()
  @IsNumber()
  quantity: number;

  postalCode?: string | null;
  fullName?: string | null;
  email?: string | null;
  currencyId?: number | 1;
  countryId?: number | null;
  stateId?: number | null;
  memberId?: number | null;
  cartSessionId?: string | null;
  createdBy?: number | null;
}
