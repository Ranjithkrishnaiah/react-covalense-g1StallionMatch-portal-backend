import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class CreateStallionPromotionDto {
  @ApiProperty({ example: 'ABD9467E-90C4-EC11-B1E4-00155D01EE2B' })
  @IsUUID()
  stallionId: string;

  @ApiProperty({ example: '2022-06-14' })
  @IsOptional()
  startDate: Date;

  endDate?: Date | null;
  expiryDate?: Date | null;

  createdBy?: number | null;
  isAutoRenew?: boolean | false;
  promotedCount: number | 1;
  stopPromotionCount: number | 0;
}
