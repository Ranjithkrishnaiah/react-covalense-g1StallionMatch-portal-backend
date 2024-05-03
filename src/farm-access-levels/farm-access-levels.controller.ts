import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FarmAccessLevelResponse } from './dto/farm-access-level-response.dto';
import { FarmAccessLevelsService } from './farm-access-levels.service';

@ApiTags('Farm Access Levels')
@Controller({
  path: 'farm-access-levels',
  version: '1',
})
export class FarmAccessLevelsController {
  constructor(
    private readonly stallionTestimonialsService: FarmAccessLevelsService,
  ) {}

  @ApiOperation({
    summary: 'Get All Farm Access Levels',
  })
  @ApiOkResponse({
    description: '',
    type: FarmAccessLevelResponse,
    isArray: true,
  })
  @Get()
  getAllAccessLevels(): Promise<FarmAccessLevelResponse[]> {
    return this.stallionTestimonialsService.getAllAccessLevels();
  }
}
