import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { MemberRole } from '../../member-roles/entities/member-role.entity';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  MinLength,
  Validate,
} from 'class-validator';
import { Status } from '../../statuses/entities/status.entity';
import { IsNotExist } from '../../utils/validators/is-not-exists.validator';
import { IsExist } from '../../utils/validators/is-exists.validator';

export class CreateMemberDto {
  @ApiProperty({ example: 'john.smith@yopmail.com' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  @IsNotEmpty()
  @Validate(IsNotExist, ['Member'], {
    message:
      'The email address is already in use. Please try another email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'bWF0dGhld2Vubmlz' })
  @MinLength(6)
  password?: string;

  provider?: string;

  socialId?: string | null;

  @ApiProperty({ example: 'John Smith' })
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: '3685' })
  @IsNotEmpty()
  postcode: string;

  @ApiProperty({ example: 10 })
  @IsNumber()
  countryId: number;

  roleId?: number | null;

  @ApiProperty({ type: Status })
  @Validate(IsExist, ['Status', 'id'], {
    message: 'statusNotExists',
  })
  status?: Status;

  hash?: string | null;
  newrole?: number | null;
}
