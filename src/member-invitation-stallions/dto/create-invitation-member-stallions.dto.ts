import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class CreateMemberInvitationStallionsDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  memberInvitationId: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  stallionId: number;

  isActive: true | false;
  createdBy?: number | null;
}
