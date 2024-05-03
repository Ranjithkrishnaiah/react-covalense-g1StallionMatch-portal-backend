import { Controller, Post, Body, UseGuards, SetMetadata } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { MareRequestsService } from './mare-requests.service';
import { CreateMareRequestDto } from './dto/create-mare-request.dto';
import { RoleGuard } from 'src/role/role.gaurd';

@ApiTags('Mare Request')
@Controller({
  path: 'mare-requests',
  version: '1',
})
export class MareRequestsController {
  constructor(private readonly mareRequestsService: MareRequestsService) {}

  @ApiOperation({ summary: 'Create Mare Request' })
  @ApiCreatedResponse({ description: 'Mare request created successfully.' })
  @ApiBearerAuth()
  @SetMetadata('api', {
    id: 'MAREREQUEST_ADD_NEW',
    method: 'CREATE',
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Post()
  create(@Body() createMare: CreateMareRequestDto) {
    return this.mareRequestsService.create(createMare);
  }
}
