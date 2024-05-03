import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class UpdateStallionNominationDto {
  @ApiProperty({ example: '2022-06-30' })
  @IsOptional()
  endDate: Date;

  isActive: boolean | null;
  modifiedBy?: number | null;
}
