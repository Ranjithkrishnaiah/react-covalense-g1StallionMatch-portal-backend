import { ApiResponseProperty } from '@nestjs/swagger';
import { MemberAddress } from 'src/member-address/entities/member-address.entity';
import { MemberRole } from 'src/member-roles/entities/member-role.entity';
import { Status } from 'src/statuses/entities/status.entity';

export class MemberResponseDto {
  @ApiResponseProperty()
  id?: string;

  @ApiResponseProperty()
  email?: string;

  @ApiResponseProperty()
  fullName?: string;

  @ApiResponseProperty()
  role?: MemberRole;

  @ApiResponseProperty()
  status?: Status;

  @ApiResponseProperty()
  memberprofileimages?: string;

  @ApiResponseProperty()
  memberaddress?: MemberAddress[];
}
