import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class StopStallionPromotionDto {
  @ApiProperty()
  @IsUUID()
  stallionId: string;

  @ApiProperty({ example: '2022-06-14' })
  @IsOptional()
  effectiveDate: Date;
}
