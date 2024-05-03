import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class CreateStallionNominationDto {
  @ApiProperty()
  @IsOptional()
  noOfNominations: number;

  @ApiProperty({ example: 'ABD9467E-90C4-EC11-B1E4-00155D01EE2B' })
  @IsUUID()
  stallionId: string;

  @ApiProperty({ example: '2022-06-14' })
  @IsOptional()
  startDate: Date;

  @ApiProperty({ example: '2022-06-30' })
  @IsOptional()
  endDate: Date;

  createdBy?: number | null;
  isActive: boolean | null;
}
