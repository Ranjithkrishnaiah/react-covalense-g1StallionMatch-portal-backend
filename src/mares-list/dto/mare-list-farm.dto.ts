import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class MareListFarmDto {
  @ApiProperty({ example: '00ca9bd5-8967-4cee-a716-5f8c81f27093' })
  @IsUUID()
  readonly farmId: string;
}
