import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateTransactionDto {
  @ApiProperty()
  @IsString()
  sessionId: string;

  paymentStatus?: number | null;
  status?: string | null;
  orderId?: number | null;
  paymentMethod?: number | null;
  mode?: string | null;
}
