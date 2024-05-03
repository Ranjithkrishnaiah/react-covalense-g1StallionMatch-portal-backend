import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateFarmMemberDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  farmId: number;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  memberId: number;

  accessLevelId?: number | null;
  isFamOwner: true | false;
  createdBy?: number | null;
  RoleId?: number | null;
}
