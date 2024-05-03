import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UpdateMemberFullNameDto {
  @ApiProperty({ example: 'John Smith' })
  @IsNotEmpty()
  fullName?: string;
}
