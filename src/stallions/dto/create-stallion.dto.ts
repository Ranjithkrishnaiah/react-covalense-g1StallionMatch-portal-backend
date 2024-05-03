import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsUUID } from 'class-validator';

export class CreateStallionDto {
  @ApiProperty({ example: 'BCEAFDE4-3FDB-EC11-B1E6-00155D01EE2B' })
  @IsNotEmpty()
  @IsUUID()
  farmId: string;

  @ApiProperty({ example: 'AC73010C-A8D2-EC11-B1E6-00155D01EE2B' })
  @IsNotEmpty()
  @IsUUID()
  horseId: string;

  @ApiProperty({ example: 2001 })
  @IsNotEmpty()
  @IsNumber()
  feeYear: number;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  currencyId: number;

  @ApiProperty({ example: 250000 })
  @IsNotEmpty()
  @IsNumber()
  fee: number;

  @ApiProperty({ example: false })
  @IsNotEmpty()
  @IsBoolean()
  isPrivateFee: boolean;

  isActive: boolean;

  feeUpdatedFrom: number | 2;
  createdBy?: number | null;
  modifiedBy?: number | null;
}
