import { PartialType } from '@nestjs/swagger';
import { CreateMemberDto } from './create-member.dto';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { MemberRole } from '../../member-roles/entities/member-role.entity';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  MinLength,
  Validate,
} from 'class-validator';
import { Status } from '../../statuses/entities/status.entity';
import { IsNotExist } from '../../utils/validators/is-not-exists.validator';
import { IsExist } from '../../utils/validators/is-exists.validator';

export class UpdateMemberDto extends PartialType(CreateMemberDto) {
  @ApiProperty({ example: 'john.smith@yopmail.com' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  @IsOptional()
  @Validate(IsNotExist, ['Member'], {
    message:
      'The email address is already in use. Please try another email address',
  })
  @IsEmail()
  email?: string | null;

  @ApiProperty({ example: 'bWF0dGhld2Vubmlz' })
  @IsOptional()
  @MinLength(6)
  password?: string;

  provider?: string;

  socialId?: string | null;

  @ApiProperty({ example: 'John Smith' })
  @IsNotEmpty()
  fullName?: string;

  @ApiProperty({ example: 10 })
  @IsNumber()
  countryId?: number;

  @ApiProperty({ type: MemberRole })
  @IsOptional()
  @Validate(IsExist, ['MemberRole', 'id'], {
    message: 'roleNotExists',
  })
  role?: MemberRole | null;

  @ApiProperty({ type: Status })
  @IsOptional()
  @Validate(IsExist, ['Status', 'id'], {
    message: 'statusNotExists',
  })
  status?: Status;

  hash?: string | null;
}
