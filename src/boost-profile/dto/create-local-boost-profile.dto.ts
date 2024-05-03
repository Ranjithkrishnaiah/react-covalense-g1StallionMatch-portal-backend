import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateLocalBoostProfileDto {
  @ApiProperty()
  @IsNotEmpty()
  message: string;

  @ApiProperty()
  @IsNotEmpty()
  boostTypeId: number;

  @ApiProperty()
  @IsNotEmpty()
  createdBy: number;
}
