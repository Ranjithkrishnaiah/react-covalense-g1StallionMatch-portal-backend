import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CreateMemberPaymentTypeAccessDto {
  @ApiProperty()
  @IsNumber()
  paymentMethodId: number;

  @ApiProperty()
  @IsString()
  email: string;

  @ApiProperty()
  @IsNumber()
  cardNumber: number;

  @ApiProperty()
  @IsNumber()
  expMonth: number;

  @ApiProperty()
  @IsNumber()
  expYear: number;

  @ApiProperty()
  @IsNumber()
  cvc: number;

  @ApiProperty()
  @IsString()
  nameOnCard: string;

  @ApiProperty()
  @IsNumber()
  country: number;

  @ApiProperty()
  @IsNumber()
  zip: number;

  customerId?: string | null;
  createdBy?: number | null;
  isActive?: boolean | true;
  isDefault?: boolean | false;
}
