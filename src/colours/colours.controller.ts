import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ColoursService } from './colours.service';
import { ColorResponse } from './dto/color-response.dto';

@ApiTags('Colours')
@Controller({
  path: 'colours',
  version: '1',
})
export class ColoursController {
  constructor(private readonly coloursService: ColoursService) {}

  @ApiOperation({
    summary: 'Get All Colours',
  })
  @ApiOkResponse({
    description: '',
    type: ColorResponse,
    isArray: true,
  })
  @Get()
  findAll(): Promise<ColorResponse[]> {
    return this.coloursService.findAll();
  }

  @ApiOperation({
    summary: 'Get All Dominancy Colours',
  })
  @ApiOkResponse({
    description: '',
    type: ColorResponse,
    isArray: true,
  })
  @Get('master')
  findAllDominancyColours(): Promise<ColorResponse[]> {
    return this.coloursService.findAllDominancyColours();
  }
}
