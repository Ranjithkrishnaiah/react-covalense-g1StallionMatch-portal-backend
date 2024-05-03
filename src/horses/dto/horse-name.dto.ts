import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class HorseNameDto {
  @ApiResponseProperty()
  @IsUUID()
  @ApiProperty({
    type: 'string',
    name: 'horseId',
  })
  horseUuid: string;

  @ApiResponseProperty()
  @IsString()
  @ApiProperty({
    type: 'string',
    name: 'horseName',
  })
  horseName: string;
}
