import { Controller, Get, Param } from '@nestjs/common';
import { StatesService } from './states.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { StateResponseDto } from './dto/state-response.dto';

@ApiTags('States')
@Controller({
  path: 'states',
  version: '1',
})
export class StatesController {
  constructor(private readonly statesService: StatesService) {}

  @ApiOperation({
    summary: 'Get All States',
  })
  @ApiOkResponse({
    description: '',
    type: StateResponseDto,
    isArray: true,
  })
  @Get()
  findAll(): Promise<StateResponseDto[]> {
    return this.statesService.findAll();
  }

  @ApiOperation({
    summary: 'Get All States By CountryId',
  })
  @ApiOkResponse({
    description: '',
    type: StateResponseDto,
    isArray: true,
  })
  @Get('by-country/:id')
  findAllByCountryId(@Param('id') id: string): Promise<StateResponseDto[]> {
    return this.statesService.findAllByCountryId(+id);
  }
}
