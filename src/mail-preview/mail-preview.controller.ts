import { Controller, Get, ParseUUIDPipe, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { MailPreviewService } from './mail-preview.service';

@ApiTags('Mail Preview')
@Controller({
  path: 'mail-preview',
  version: '1',
})
export class MailPreviewController {
  constructor(private readonly mpService: MailPreviewService) {}

  @ApiOperation({
    summary: 'Get List of Contact Us Interests',
  })
  @Get(':dirIdentity/:fileIdentity')
  async getMailData(
    @Param('dirIdentity', new ParseUUIDPipe()) dirIdentity: string,
    @Param('fileIdentity', new ParseUUIDPipe()) fileIdentity: string,
  ) {
    return await this.mpService.fetchMail(dirIdentity, fileIdentity);
  }
}
