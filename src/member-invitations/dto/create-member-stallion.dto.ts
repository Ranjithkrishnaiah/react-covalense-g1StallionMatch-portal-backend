import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsUUID } from 'class-validator';

export class CreateUserInvitationStallionDto {
  @ApiProperty({ example: 15 })
  @IsNumber()
  memberInvitationId: number;

  @ApiProperty({
    example: [
      'AC73010C-A8D2-EC11-B1E6-00155D01EE2B',
      '3426D190-3CD5-EC11-B1E6-00155D01EE2B',
    ],
  })
  @IsArray()
  stallionIds: Array<string>;

  @ApiProperty()
  @IsUUID()
  farmId: string;
  /* Stallions list will be added when user access level is 3rd party*/
}
