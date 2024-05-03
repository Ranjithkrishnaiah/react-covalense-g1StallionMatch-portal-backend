import { Controller } from '@nestjs/common';
import { MemberSocialShareService } from './member-social-share.service';

// @ApiTags('Member Social Share')
@Controller({
  path: 'member-social-share',
  version: '1',
})
export class MemberSocialShareController {
  constructor(
    private readonly memberSocialShareService: MemberSocialShareService,
  ) {}
}
