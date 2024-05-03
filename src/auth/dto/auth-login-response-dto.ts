import { ApiResponseProperty } from '@nestjs/swagger';
import { AuthMemberResponseDto } from './auth-member-response-dto';
import { MyFarmsResponseDto } from './my-farms-response-dto';

export class AuthLoginResponseDto {
  @ApiResponseProperty()
  accessToken: string;

  @ApiResponseProperty()
  refreshToken: string;

  @ApiResponseProperty()
  myFarms: MyFarmsResponseDto[] | null;

  @ApiResponseProperty()
  stallionShortlistCount: number;

  @ApiResponseProperty()
  member: AuthMemberResponseDto | null;
}
