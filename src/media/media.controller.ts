import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { MediaService } from './media.service';

@ApiTags('Media')
@Controller({
  path: 'media',
  version: '1',
})
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @ApiOperation({
    summary: 'Check Media File Status',
  })
  @ApiOkResponse({
    description: 'INPROGRESS/SUCCESS',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Post('status')
  isMediaReady(@Body() mediauuids: []) {
    return this.mediaService.mediaUploadStatus(mediauuids);
  }
}
