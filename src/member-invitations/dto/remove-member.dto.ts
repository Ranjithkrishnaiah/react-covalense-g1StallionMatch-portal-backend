import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsUUID } from 'class-validator';

export class RemoveUserInvitationDto {
  @ApiProperty()
  @IsNumber()
  invitationId: number;

  @ApiProperty()
  @IsUUID()
  farmId: string;
}
