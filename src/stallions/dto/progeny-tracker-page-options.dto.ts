import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsUUID } from 'class-validator';
import { PageOptionsDto } from 'src/utils/dtos/page-options.dto';

export class ProgenyTrackerPageOptionsDto extends PageOptionsDto {
  @ApiProperty({ example: '99FC575C-F579-ED11-B1F1-00155D01EE2B' })
  @IsUUID()
  stallionId: string;

  @ApiProperty({ example: '2012-01-01' })
  @IsDateString()
  fromDate: string;

  @ApiProperty({ example: '2013-12-31' })
  @IsDateString()
  toDate: string;
}
