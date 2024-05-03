import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Validate } from 'class-validator';
import { IsExist } from 'src/utils/validators/is-exists.validator';
import { Transform } from 'class-transformer';

export class AuthEmailLoginDto {
  @ApiProperty({ example: 'john.smith@yopmail.com' })
  @Transform(({ value }) => value.toLowerCase().trim())
  @Validate(IsExist, ['Member'], {
    message: 'Email Not Exist!',
  })
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  password: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  invitationKey: string;
}
