import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AlternateMatingSuggestionsDto {
  @ApiProperty()
  @IsUUID()
  readonly stallionId?: string;

  @ApiProperty()
  @IsUUID()
  readonly mareId?: string;
}
