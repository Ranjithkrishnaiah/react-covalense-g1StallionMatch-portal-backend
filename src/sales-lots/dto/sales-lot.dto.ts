import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class SalesLotDto {
  @ApiProperty()
  @IsOptional()
  sales: Array<number>;
}
