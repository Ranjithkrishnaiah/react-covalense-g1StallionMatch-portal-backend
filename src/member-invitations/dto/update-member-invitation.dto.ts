import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsUUID } from 'class-validator';

export class UpdateUserInvitationDto {
  @ApiProperty({ example: '1' })
  @IsNotEmpty()
  @IsNumber()
  accessLevelId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  memberInvitationId: number;

  @ApiProperty()
  @IsUUID()
  farmId: string;

  @ApiProperty({
    example: [
      'AC73010C-A8D2-EC11-B1E6-00155D01EE2B',
      '3426D190-3CD5-EC11-B1E6-00155D01EE2B',
    ],
  })
  @IsArray()
  stallionIds: Array<string>;
}
