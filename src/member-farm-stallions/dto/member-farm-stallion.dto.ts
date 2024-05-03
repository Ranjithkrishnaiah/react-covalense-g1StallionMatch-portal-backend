import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class MemberFarmStallionDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  memberFarmId: number;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  stallionId: number;

  createdBy?: number | null;
}
