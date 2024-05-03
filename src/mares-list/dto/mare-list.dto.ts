import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class MareListDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;
}
