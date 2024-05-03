import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class UpdatePromotionDto {
  @ApiProperty()
  @IsUUID()
  stallionId: string;
}
