import { ApiResponseProperty } from '@nestjs/swagger';
import { MemberAddress } from 'src/member-address/entities/member-address.entity';
import { MemberRole } from 'src/member-roles/entities/member-role.entity';
import { Status } from 'src/statuses/entities/status.entity';

export class AuthMemberResponseDto {
  @ApiResponseProperty()
  id: string;

  @ApiResponseProperty()
  email: string;

  @ApiResponseProperty()
  fullName: string;

  @ApiResponseProperty()
  roleId: number;

  @ApiResponseProperty()
  status: Status;

  @ApiResponseProperty()
  provider: string;

  @ApiResponseProperty()
  memberaddress: MemberAddress[];
}
