import { Controller } from '@nestjs/common';
import { MemberAddressService } from './member-address.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Member Address')
@Controller({
  path: 'member-address',
  version: '1',
})
export class MemberAddressController {
  constructor(private readonly memberAddressService: MemberAddressService) {}
}
