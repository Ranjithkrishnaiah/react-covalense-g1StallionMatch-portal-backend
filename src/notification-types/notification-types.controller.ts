import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { NotificationTypesResponse } from './dto/notification-types-response';
import { NotificationTypesService } from './notification-types.service';

@ApiTags('Notification Types')
@Controller({
  path: 'notification-types',
  version: '1',
})
export class NotificationTypesController {
  constructor(
    private readonly notificationTypesService: NotificationTypesService,
  ) {}

  @ApiOperation({
    summary: 'Get All Notification - Types ',
  })
  @ApiOkResponse({
    description: '',
    type: NotificationTypesResponse,
    isArray: true,
  })
  @Get()
  findAll(): Promise<NotificationTypesResponse[]> {
    return this.notificationTypesService.findAll();
  }
}
