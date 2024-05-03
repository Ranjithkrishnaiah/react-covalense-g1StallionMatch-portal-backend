import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsEmail,
  IsString,
  IsNotEmpty,
  IsUUID,
} from 'class-validator';

export class CreateTransactionDto {
  @ApiProperty()
  @IsString()
  orderUuid: string;

  @ApiProperty()
  @IsString()
  sessionId: string;

  @ApiProperty()
  @IsNumber()
  total: number;

  @ApiProperty()
  @IsNumber()
  subTotal: number;

  @ApiProperty()
  @IsNumber()
  discount: number;

  @ApiProperty()
  @IsNumber()
  taxPercent: number;

  @ApiProperty()
  @IsNumber()
  taxValue: number;

  paymentStatus?: number | null;
  status?: string | null;
  paymentIntent?: string | null;
  couponId?: number | null;
  muid?: string | null;
  guid?: string | null;
  suid?: string | null;
  orderId?: number | null;
  paymentMethod?: number | null;
  createdBy?: number | null;
  memberId?: number | null;
  mode?: string | null;
  payerId?: string | null;
  receiptUrl?: string | null;
  transactionId?: string | null;
}
