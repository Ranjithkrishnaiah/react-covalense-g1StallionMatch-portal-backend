import { Controller, Post, Body, UseGuards, SetMetadata } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { StallionRequestsService } from './stallion-requests.service';
import { CreateStallionRequestDto } from './dto/create-stallion-request.dto';
import { RoleGuard } from 'src/role/role.gaurd';

@ApiTags('Stallion Request')
@Controller({
  path: 'stallion-requests',
  version: '1',
})
export class StallionRequestsController {
  constructor(
    private readonly stallionRequestsService: StallionRequestsService,
  ) {}

  @ApiOperation({
    summary: 'Add New Stallion Request',
  })
  @ApiCreatedResponse({ description: 'Stallion request created successfully.' })
  @ApiBearerAuth()
  @SetMetadata('api', {
    id: 'STALLIONREQUESTS_ADD_NEW',
    method: 'CREATE',
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Post()
  create(@Body() createStallion: CreateStallionRequestDto) {
    return this.stallionRequestsService.create(createStallion);
  }
}
