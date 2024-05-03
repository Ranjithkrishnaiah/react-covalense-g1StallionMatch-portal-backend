import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsUUID } from 'class-validator';

export class ResendInvitationDto {
  @ApiProperty()
  @IsNumber()
  invitationId: number;

  @ApiProperty()
  @IsUUID()
  farmId: string;
}
