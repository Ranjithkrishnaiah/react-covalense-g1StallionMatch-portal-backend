import { Controller, Post, Body, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CommonUtilsService } from 'src/common-utils/common-utils.service';
import { ContactusService } from './contactus.service';
import { ContactusDto } from './dto/contactus.dto';

@ApiTags('Contact Us')
@Controller({
  path: 'contactus',
  version: '1',
})
export class ContactusController {
  constructor(
    private readonly contactusService: ContactusService,
    private readonly commonUtilsService: CommonUtilsService,
  ) {}

  @ApiOperation({
    summary: 'Capture Contact Us Data',
  })
  @ApiOkResponse({
    description: 'Information has been submitted successfully',
  })
  @Post()
  create(@Body() contactusDto: ContactusDto) {
    return this.contactusService.create(contactusDto);
  }

  @ApiOperation({
    summary: 'Get List of Contact Us Interests',
  })
  @ApiOkResponse({
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          name: { type: 'string' },
        },
      },
    },
  })
  @Get('interests')
  getContactusInterests() {
    return this.commonUtilsService.getContactusInterests();
  }
}
