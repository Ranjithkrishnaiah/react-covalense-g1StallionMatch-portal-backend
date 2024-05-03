import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MemberProfileImageService } from './member-profile-image.service';

@ApiTags('Stallion Gallery Images')
@Controller({
  path: 'member-profile-image',
  version: '1',
})
@Controller('member-profile-image')
export class MemberProfileImageController {
  constructor(
    private readonly memberProfileImageService: MemberProfileImageService,
  ) {}
}
