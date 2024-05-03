import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class CreateReportProductItemDto {
    @ApiProperty()
    @IsNumber()
    orderProductId: number;

    stallionId?: number | null;
    farmId?: number | null;
    mareId?: number | null;
    stallionPromotionId?: number | null;
    stallionNominationId?: number | null;
    createdBy?: number | null;
    commonList?: string | null;
    sales?: string | null;
    lotId?: number | null;
    boostProfileId?: number | null;
}
