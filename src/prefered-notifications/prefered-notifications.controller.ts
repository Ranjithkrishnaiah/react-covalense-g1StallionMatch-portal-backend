import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  SetMetadata,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { PreferedNotificationService } from './prefered-notifications.service';
import { CreatePreferedNotificationDto } from './dto/create-prefered-notification.dto';
import { PreferedNotificationResponseDto } from './dto/prefered-notification-response.dto';
import { RoleGuard } from 'src/role/role.gaurd';

@ApiTags('Prefered Notifications')
@Controller({
  path: 'prefered-notifications',
  version: '1',
})
export class PreferedNotificationsController {
  constructor(
    private readonly preferedNotificationService: PreferedNotificationService,
  ) {}

  @ApiOperation({ summary: 'Create Prefered Notification' })
  @ApiCreatedResponse({
    description: 'Prefered Notification created Successfully.',
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    id: 'PREFERREDNOTIFICATIONS_CREATE',
    method: 'CREATE',
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Post()
  create(@Body() createPreferedNotificationDto: CreatePreferedNotificationDto) {
    return this.preferedNotificationService.create(
      createPreferedNotificationDto,
    );
  }

  @ApiOperation({ summary: 'Get All Prefered Notifications' })
  @ApiOkResponse({
    description: '',
    type: PreferedNotificationResponseDto,
    isArray: true,
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    id: 'PREFERREDNOTIFICATIONS_GET',
    method: 'READ',
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get()
  getAll(): Promise<PreferedNotificationResponseDto[]> {
    return this.preferedNotificationService.getAll();
  }
}
