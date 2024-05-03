import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUUID,
} from 'class-validator';
export class UpdateStallionProfileDto {
  @ApiProperty({ example: '0b1bb614-c501-4753-a354-0731771b13ba' })
  @IsNotEmpty()
  @IsUUID()
  farmId: string;

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

  @ApiProperty()
  @IsNotEmpty()
  height: string;

  @ApiProperty({ example: 2001 })
  @IsNotEmpty()
  yearToStud: number;

  @ApiProperty({ example: '098d69cd-6a95-479e-8444-36c37bfd30e3' })
  @IsOptional()
  @IsUUID()
  profileImageuuid: string; //If Profile image not uploaded this will be empty

  feeUpdatedFrom: number | null;

  modifiedBy?: number | null;
}
