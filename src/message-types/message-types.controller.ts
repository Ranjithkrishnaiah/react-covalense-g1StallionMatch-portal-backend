import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common';
import { MessageTypesService } from './message-types.service';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from 'src/member-roles/roles.decorator';
import { RoleEnum } from 'src/member-roles/roles.enum';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { RolesGuard } from 'src/member-roles/roles.guard';
import { PageOptionsDto } from 'src/utils/dtos/page-options.dto';
import { MessageTypeResponseDto } from './dto/message-type-response.dto';

@ApiTags('Message Types')
@Controller({
  path: 'message-type',
  version: '1',
})
export class MessageTypesController {
  constructor(private readonly messageTypesService: MessageTypesService) {}
}
