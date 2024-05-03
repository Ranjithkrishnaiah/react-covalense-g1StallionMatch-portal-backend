import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { CreateMsgRecepientDto } from './dto/create-recipient.dto';
import { RecipientResponseDto } from './dto/recipient-response.dto';
import { MessageRecipientsService } from './message-recipients.service';

@ApiTags('Message Recepients')
@Controller({
  path: 'message-recipients',
  version: '1',
})
export class MessageRecipientsController {
  constructor(
    private readonly messageRecipientsService: MessageRecipientsService,
  ) {}

  @ApiOperation({
    summary: 'Get All Messages - By Farm',
  })
  @ApiOkResponse({
    description: '',
    type: RecipientResponseDto,
    isArray: true,
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<RecipientResponseDto[]> {
    return this.messageRecipientsService.findAll();
  }

  @ApiOperation({
    summary: 'Create Message Recepients',
  })
  @ApiOkResponse({
    description: 'Create Successfully.',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createMessageDto: CreateMsgRecepientDto) {
    return this.messageRecipientsService.create(createMessageDto);
  }
}
