import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SocialShareTypeService } from './social-share-type.service';
import { SocialShareTypeResponse } from './dto/social-share-type-response.dto';

@ApiTags('SocialShareType')
@Controller({
  path: 'social-share-type',
  version: '1',
})
export class SocialShareTypeController {
  constructor(
    private readonly socialShareTypeService: SocialShareTypeService,
  ) {}

  @ApiOperation({
    summary: 'Get All Social Share Types',
  })
  @ApiOkResponse({
    description: '',
    type: SocialShareTypeResponse,
    isArray: true,
  })
  @Get()
  findAll(): Promise<SocialShareTypeResponse[]> {
    return this.socialShareTypeService.findAll();
  }

  @ApiOperation({
    summary: 'Get Social Share Type By Id',
  })
  @ApiOkResponse({
    description: '',
    type: SocialShareTypeResponse,
  })
  @Get(':id')
  findOne(@Param('id') id: number): Promise<SocialShareTypeResponse> {
    return this.socialShareTypeService.findOne(id);
  }
}
