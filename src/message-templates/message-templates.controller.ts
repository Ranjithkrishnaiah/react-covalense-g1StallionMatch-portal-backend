import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Get,
  Post,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { CreateMessageTemplateDto } from './dto/create-message-template.dto';
import { MessageTemplatesService } from './message-templates.service';
import { SearchOptionsDto } from './dto/search-options.dto';
import { MessageTemplateResponse } from './dto/message-template-response.dto';
import { PageDto } from 'src/utils/dtos/page.dto';
import { ApiPaginatedResponse } from 'src/utils/decorators/api-paginated-response.decorator';

@ApiTags('Message Templates')
@Controller({
  path: 'message-templates',
  version: '1',
})
export class MessageTemplatesController {
  constructor(
    private readonly messageTemplatesService: MessageTemplatesService,
  ) {}

  @ApiOperation({
    summary: 'Get All Message Templates by Search',
  })
  @ApiPaginatedResponse(MessageTemplateResponse)
  @ApiOkResponse({
    description: '',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query() pageOptionsDto: SearchOptionsDto,
  ): Promise<PageDto<MessageTemplateResponse[]>> {
    return this.messageTemplatesService.findAll(pageOptionsDto);
  }

  @ApiOperation({
    summary: 'Create Message Template',
  })
  @ApiCreatedResponse({ description: 'Template created successfully.' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createMessageTemplate(
    @Body() messageTemplateDto: CreateMessageTemplateDto,
  ) {
    return this.messageTemplatesService.createMessageTemplate(
      messageTemplateDto,
    );
  }
}
