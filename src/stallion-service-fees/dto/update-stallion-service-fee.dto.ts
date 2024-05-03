import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class UpdateStallionServiceFeeDto {
  @ApiProperty({ example: 7 })
  @IsNumber()
  currencyId: number;

  @ApiProperty({ example: 2022 })
  @IsNumber()
  feeYear: number;

  @ApiProperty({ example: 5000 })
  @IsNumber()
  fee: number;

  feeUpdatedFrom?: number | 2;
  createdBy?: number | null;
  modifiedBy?: number | null;
  stallionId?: number | null;
  feeStatus?: number | 1;
}
