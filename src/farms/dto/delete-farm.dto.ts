import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class DeleteFarmDto {
  @ApiProperty()
  @IsUUID()
  farmId: string;
}
