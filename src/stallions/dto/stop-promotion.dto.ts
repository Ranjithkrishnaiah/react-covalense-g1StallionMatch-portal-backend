import { ApiProperty } from '@nestjs/swagger';
import { IsDate } from 'class-validator';

export class StopPromotionDto {
  @ApiProperty({ example: '2022-07-24' })
  @IsDate()
  effectiveDate: Date;
}
