import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AcceptFarmInvitationDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  invitationKey: string;
}
