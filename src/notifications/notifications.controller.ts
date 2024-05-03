import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  SetMetadata,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/notifications.dto';
import { SearchOptionsDto } from './dto/search-options.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { NotificationResponseDto } from './dto/notification-response.dto';
import { PageDto } from 'src/utils/dtos/page.dto';
import { ApiPaginatedResponse } from 'src/utils/decorators/api-paginated-response.decorator';
import { UnreadCountResponseDto } from 'src/messages/dto/unread-count-response.dto';
import { RoleGuard } from 'src/role/role.gaurd';
import { SearchOptionsFarmDto } from './dto/search-options-farm.dto';

@ApiTags('Notifications')
@Controller({
  path: 'notifications',
  version: '1',
})
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @ApiOperation({
    summary: 'Get All Notification by Search',
  })
  @ApiPaginatedResponse(NotificationResponseDto)
  @ApiBearerAuth()
  @SetMetadata('api', {
    id: 'NOTIFICATIONS_GET',
    method: 'READ',
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get()
  findAll(
    @Query() pageOptionsDto: SearchOptionsDto,
  ): Promise<PageDto<NotificationResponseDto[]>> {
    return this.notificationsService.findAll(pageOptionsDto);
  }

  @ApiOperation({
    summary: 'Get All Notification of a farm',
  })
  @ApiPaginatedResponse(NotificationResponseDto)
  @ApiBearerAuth()
  @SetMetadata('api', {
    id: 'NOTIFICATIONS_GET_FARM',
    method: 'READ',
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('farm')
  findForFarm(
    @Query() pageOptionsDto: SearchOptionsFarmDto,
  ): Promise<PageDto<NotificationResponseDto[]>> {
    return this.notificationsService.findForFarm(pageOptionsDto);
  }

  @ApiOperation({
    summary: 'Get Unread Notification Count',
  })
  @ApiOkResponse({
    description: '',
    type: UnreadCountResponseDto,
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    id: 'NOTIFICATIONS_UNREADCOUNT',
    method: 'READ',
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('unread-count')
  @HttpCode(HttpStatus.OK)
  async getMsgCount(): Promise<UnreadCountResponseDto> {
    return this.notificationsService.getCount();
  }

  @ApiOperation({
    summary: 'Delete Notification - By id',
  })
  @ApiOkResponse({
    description: 'Notification deleted successfully.',
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    id: 'NOTIFICATIONS_DELETE',
    method: 'DELETE',
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Delete()
  deleteNotification(@Body() updateNotificationDto: UpdateNotificationDto) {
    return this.notificationsService.deleteNotification(updateNotificationDto);
  }

  @ApiOperation({
    summary: 'Create Notification',
  })
  @ApiCreatedResponse({
    description: 'Notification created successfully.',
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    id: 'NOTIFICATIONS_CREATE',
    method: 'CREATE',
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Post()
  create(@Body() createNotification: CreateNotificationDto) {
    return this.notificationsService.create(createNotification);
  }

  @ApiOperation({
    summary: 'Update Notification - Mark as read',
  })
  @ApiOkResponse({
    description: 'Notification updated successfully.',
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    id: 'NOTIFICATIONS_UPDATE',
    method: 'UPDATE',
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Patch()
  patch(@Body() updateNotificationDto: UpdateNotificationDto) {
    return this.notificationsService.updateNotification(updateNotificationDto);
  }
}
