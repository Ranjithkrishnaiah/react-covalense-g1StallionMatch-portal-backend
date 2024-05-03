import {
  Body,
  Controller,
  Patch,
  Post,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { FileUploadUrlDto } from 'src/file-uploads/dto/file-upload-url.dto';
import { RoleGuard } from 'src/role/role.gaurd';
import { CreateMessageMediaDto } from './dto/create-message-media.dto';
import { MessageMediaService } from './message-media.service';

@ApiTags('Message Media')
@Controller({
  path: 'message-media',
  version: '1',
})
export class MessageMediaController {
  constructor(private readonly messageMediaService: MessageMediaService) { }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Message Media - File Upload Initiation',
  })
  @ApiCreatedResponse({
    description: 'Message Media - Upload Initiated',
  })
  @SetMetadata('api', {
    id: 'MESSAGES_GET_MEDIA_PRESIGNEDURL',
    method: 'READ',
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Post()
  async galleryImageUpload(@Body() data: FileUploadUrlDto) {
    return await this.messageMediaService.getMediaUploadPresignedUrl(data);
  }

  @ApiOperation({
    summary: 'Message - Update Media Info',
  })
  @ApiOkResponse({
    description: '',
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    id: 'MESSAGES_CREATE_MEDIA_RECORD',
    method: 'CREATE',
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Patch()
  createMediaRecords(@Body() data: CreateMessageMediaDto) {
    return this.messageMediaService.createMediaRecords(data);
  }
}
