import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsUUID,
} from 'class-validator';

export class CreateUserInvitationDto {
  @ApiProperty({ example: 'John Smith' })
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: 'john.smith@yopmail.com' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: '0b1bb614-c501-4753-a354-0731771b13ba' })
  @IsUUID()
  farmId: string;

  @ApiProperty({ example: '1' })
  @IsNotEmpty()
  @IsNumber()
  accessLevelId: number;

  @ApiProperty({
    example: [
      'AC73010C-A8D2-EC11-B1E6-00155D01EE2B',
      '3426D190-3CD5-EC11-B1E6-00155D01EE2B',
    ],
  })
  @IsArray()
  stallionIds: Array<string>;

  /* Stallions list will be added when user access level is 3rd party*/

  hash?: string | null;
  memberId?: number | null;
}
