import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RegionResponse } from './dto/region-response.dto';
import { RegionsService } from './regions.service';

@ApiTags('Regions')
@Controller({
  path: 'regions',
  version: '1',
})
export class RegionsController {
  constructor(private readonly regionsService: RegionsService) {}

  @ApiOperation({
    summary: 'Get All Regions',
  })
  @ApiOkResponse({
    description: '',
    type: RegionResponse,
    isArray: true,
  })
  @Get()
  findAll(): Promise<RegionResponse[]> {
    return this.regionsService.findAll();
  }

  @ApiOperation({
    summary: 'Get All Regions By Id',
  })
  @ApiOkResponse({
    description: '',
    type: RegionResponse,
  })
  @Get(':id')
  findOne(@Param('id') id: string): Promise<RegionResponse> {
    return this.regionsService.findOne(+id);
  }
}
