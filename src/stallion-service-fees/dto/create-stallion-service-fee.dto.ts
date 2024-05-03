import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber } from 'class-validator';

export class CreateStallionServiceFeeDto {
  @ApiProperty()
  @IsNumber()
  currencyId: number;

  @ApiProperty()
  @IsNumber()
  feeYear: number;

  @ApiProperty()
  @IsNumber()
  fee: number;

  @ApiProperty()
  @IsBoolean()
  isPrivateFee: boolean;

  feeUpdatedFrom?: number | 2; //1 - Admin, 2- Farm Update
  createdBy?: number | null;
  stallionId?: number | null;
}
