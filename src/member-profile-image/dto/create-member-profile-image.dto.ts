import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsUUID } from 'class-validator';

export class MemberProfileImageDto {
  @ApiProperty()
  @IsUUID()
  mediauuid: string;
}
