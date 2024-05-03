import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class InvitationLinkDto {
  @ApiProperty()
  @IsNotEmpty()
  hash: string;
}
