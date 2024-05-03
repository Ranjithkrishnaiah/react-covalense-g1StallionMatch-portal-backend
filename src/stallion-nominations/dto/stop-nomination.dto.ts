import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class StopStallionNominationDto {
  @ApiProperty({ example: '2022-06-14' })
  @IsOptional()
  effectiveDate: Date;
}
