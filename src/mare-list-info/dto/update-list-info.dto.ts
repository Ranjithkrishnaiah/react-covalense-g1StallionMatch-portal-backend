import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class UpdateListInfoDto {
  @ApiProperty({ example: 'List Info' })
  @IsString()
  @IsNotEmpty()
  listname: string;

  @ApiProperty({ example: '00ca9bd5-8967-4cee-a716-5f8c81f27093' })
  @IsUUID()
  farmId: string;

  modifiedBy: number | null;
}
