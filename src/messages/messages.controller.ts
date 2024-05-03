import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Injectable,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Res,
  Scope,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { RoleGuard } from 'src/role/role.gaurd';
import { LatestMessagLimit } from 'src/utils/constants/messaging';
import { ChannelDto } from './dto/channel.dto';
import { CreateChannelPayloadDto } from './dto/create-channel-payload.dto';
import { CreateMessageUnregisteredDto } from './dto/create-message-unregistered.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { DeleteMessageDto } from './dto/delete-message.dto';
import { EnquiredFarmMessagesResponseDto } from './dto/enquired-farm-message-response.dto';
import { MediaDownloadOptionsDto } from './dto/media-download-options.dto';
import { MessagesByFarmResponseDto } from './dto/messages-by-farm-response.dto';
import { MessageCountResponseDto } from './dto/messages-count-response.dto';
import { MessagesListResponseDto } from './dto/messages-list-response.dto';
import { SearchOptionsDto } from './dto/search-options.dto';
import { UnreadCountResponseDto } from './dto/unread-count-response.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { MessageService } from './messages.service';

@ApiTags('Messages')
@Controller({
  path: 'message',
  version: '1',
})
@Injectable({ scope: Scope.REQUEST })
export class MessageController {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private readonly messageService: MessageService,
  ) {}

  @ApiOperation({
    summary: 'Get All Messages',
  })
  @ApiOkResponse({
    description: '',
    type: MessagesListResponseDto,
    isArray: true,
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    id: 'MESSAGES_GET',
    method: 'READ',
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@Query() searchOptionsDto: SearchOptionsDto) {
    return this.messageService.findAll(searchOptionsDto);
  }

  @ApiOperation({
    summary: 'Get All Messages - Enquired Farms',
  })
  @ApiOkResponse({
    description: '',
    type: EnquiredFarmMessagesResponseDto,
    isArray: true,
  })
  @SetMetadata('api', {
    id: 'MESSAGES_GET_ENQUIREDFARMS',
    method: 'READ',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('enquired-farms')
  @HttpCode(HttpStatus.OK)
  async getEnquiredFarms(): Promise<EnquiredFarmMessagesResponseDto[]> {
    return this.messageService.getEnquiredFarms();
  }

  @ApiOperation({
    summary: 'Get Unread Message Count',
  })
  @ApiOkResponse({
    description: '',
    type: UnreadCountResponseDto,
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    id: 'MESSAGES_GET_UNREADCOUNT',
    method: 'READ',
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('unread-count')
  @HttpCode(HttpStatus.OK)
  async getMsgCount(): Promise<UnreadCountResponseDto> {
    return this.messageService.getMsgCount();
  }

  @ApiOperation({
    summary: 'Get Chat History - By Farm',
  })
  @ApiOkResponse({
    description: '',
    type: MessagesByFarmResponseDto,
    isArray: true,
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    id: 'MESSAGES_GET_CHATHISTORY',
    method: 'READ',
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get(':channelId')
  @HttpCode(HttpStatus.OK)
  async findMsgHistory(
    @Param('channelId', new ParseUUIDPipe()) channelId: string,
  ): Promise<MessagesByFarmResponseDto[]> {
    return this.messageService.findMsgHistory(channelId);
  }

  // API for Latest Messages in Dashboard's

  @ApiOperation({
    summary: 'Get Latest Messages - By Farm',
  })
  @ApiOkResponse({
    description: '',
    type: MessagesByFarmResponseDto,
    isArray: true,
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    id: 'MESSAGES_GET_LATEST',
    method: 'READ',
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('farm/:farmId/latest')
  @HttpCode(HttpStatus.OK)
  async findLatestTwoMessages(
    @Param('farmId') farmId: string,
  ): Promise<MessagesByFarmResponseDto[]> {
    const limit = LatestMessagLimit.LIMIT;
    return this.messageService.findAuthLatestTwoMessages(limit, farmId);
  }

  @ApiOperation({
    summary: 'Get Latest Messages',
  })
  @ApiOkResponse({
    description: '',
    type: MessagesByFarmResponseDto,
    isArray: true,
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    id: 'MESSAGES_GET_MEMBERLATEST',
    method: 'READ',
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('member/latest')
  @HttpCode(HttpStatus.OK)
  async findAuthLatestTwoMessages(): Promise<MessagesByFarmResponseDto[]> {
    const limit = LatestMessagLimit.LIMIT;
    return this.messageService.findAuthLatestTwoMessages(limit, '');
  }

  @ApiOperation({
    summary: 'Get Message Count - By Farm',
  })
  @ApiOkResponse({
    description: '',
    type: MessageCountResponseDto,
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    id: 'MESSAGES_GET_UNREADCOUNT_BYFARMID',
    method: 'READ',
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('all-counts/:farmId')
  @HttpCode(HttpStatus.OK)
  async allCounts(
    @Param('farmId') farmId: string,
  ): Promise<MessageCountResponseDto> {
    return this.messageService.allCounts(farmId);
  }

  @ApiOperation({
    summary: 'Create a Message',
  })
  @ApiCreatedResponse({ description: 'Message created successfully.' })
  @ApiBearerAuth()
  @SetMetadata('api', {
    id: 'MESSAGES_CREATE',
    method: 'CREATE',
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createMessageDto: CreateMessageDto) {
    return this.messageService.create(createMessageDto);
  }

  @ApiOperation({
    summary: 'Create a Message By Unregistered',
  })
  @ApiCreatedResponse({ description: 'Message created successfully.' })
  @Post('unregistered')
  @HttpCode(HttpStatus.CREATED)
  async createUnregistered(
    @Body() createMessageDto: CreateMessageUnregisteredDto,
  ) {
    return this.messageService.createUnregistered(createMessageDto);
  }

  @ApiOperation({
    summary: 'Update channel',
  })
  @ApiCreatedResponse({ description: 'channel updated successfully.' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Patch()
  updateMessage(@Body() updateDto: UpdateMessageDto) {
    return this.messageService.updateMessage(updateDto);
  }

  @ApiOperation({
    summary: 'Message Update - Mark As Read',
  })
  @ApiOkResponse({
    description: 'Message updated successfully.',
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    id: 'MESSAGES_UPDATE_READMSG',
    method: 'UPDATE',
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Patch('read/:channelId')
  @HttpCode(HttpStatus.CREATED)
  async patch(@Param('channelId', new ParseUUIDPipe()) channelId: string) {
    return this.messageService.readMsgs(channelId);
  }

  @ApiOperation({
    summary: 'Remove message',
  })
  @ApiOkResponse({
    description: 'conversation removed successfully',
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    id: 'MESSAGES_DELETE',
    method: 'DELETE',
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Delete()
  remove(@Body() deleteMessageDto: DeleteMessageDto) {
    return this.messageService.remove(deleteMessageDto);
  }

  @ApiOperation({
    summary: 'Get Member Message Channel By RecieverId',
  })
  @ApiOkResponse({
    description: '',
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    id: 'MESSAGES_CREATE_GETCHANNEL',
    method: 'CREATE',
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Post('channel-by-recieverid')
  @HttpCode(HttpStatus.OK)
  async getChannel(@Body() getChannelDto: ChannelDto) {
    return this.messageService.getChannel(getChannelDto);
  }

  @ApiOperation({
    summary: 'Get Member Message Channel By RecieverId',
  })
  @ApiOkResponse({
    description: '',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Post('check-channel')
  @HttpCode(HttpStatus.OK)
  async checkChannel(@Body() createChannelDto: CreateChannelPayloadDto) {
    return this.messageService.checkChannel(createChannelDto);
  }

  @ApiOperation({
    summary: 'Get Channel info - By ChannelId',
  })
  @ApiOkResponse({
    description: 'Get Channel info - By ChannelId',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Get('channel/:channelId')
  @HttpCode(HttpStatus.OK)
  async getChannelInfo(
    @Param('channelId', new ParseUUIDPipe()) channelId: string,
  ) {
    return this.messageService.getChannelInfo(channelId);
  }

  @ApiOperation({
    summary: 'Add member to a Channel after login (Unregistered)',
  })
  @ApiOkResponse({
    description: 'Add member to a Channel - By ChannelId',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Patch('add-member-to-channel/:channelId')
  @HttpCode(HttpStatus.OK)
  async addMemberToChannel(
    @Param('channelId', new ParseUUIDPipe()) channelId: string,
  ) {
    return this.messageService.addMemberToChannel(channelId);
  }

  @ApiOperation({
    summary: 'Restore message',
  })
  @ApiOkResponse({
    description: 'conversation restored successfully',
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    id: 'MESSAGES_UPDATE_RESTORE',
    method: 'UPDATE',
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Patch('restore/:channelId')
  restore(@Param('channelId', new ParseUUIDPipe()) channelId: string) {
    return this.messageService.restore(channelId);
  }

  @ApiOperation({
    summary: 'Get Message Media',
  })
  @ApiOkResponse({
    description: 'Get Message Media',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Get('media/:mediaId')
  @HttpCode(HttpStatus.OK)
  async getMessageMedia(
    @Param('mediaId', new ParseUUIDPipe()) mediaId: string,
    @Query() searchOptionsDto: MediaDownloadOptionsDto,
    @Res() res: Response,
  ) {
    const finalData = await this.messageService.getMessageMedia(mediaId);
    const s3Object = finalData.s3Object;
    const fileData = finalData.fileData;
    /*
     * May need this if the file is a document
     * const contentDisposition = `attachment; filename="${key}"`;
     */
    res.set({
      'Content-Type': fileData.mediaFileType,
      'Content-Length': fileData.mediaFileSize,
      'Content-Disposition': `${searchOptionsDto.mediaDownloadType}; filename="${fileData.fileName}"`,
    });
    res.send(s3Object.Body);
  }
}
