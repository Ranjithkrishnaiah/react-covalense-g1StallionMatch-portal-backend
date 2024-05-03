import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrenciesService } from './currencies.service';
import { CurrencyResponseDto } from './dto/currency-response.dto';

@ApiTags('Currencies')
@Controller({
  path: 'currencies',
  version: '1',
})
export class CurrenciesController {
  constructor(private readonly currenciesService: CurrenciesService) {}

  @ApiOperation({
    summary: 'Get All Available Currencies',
  })
  @ApiOkResponse({
    description: '',
    type: CurrencyResponseDto,
    isArray: true,
  })
  @Get()
  findAll(): Promise<CurrencyResponseDto[]> {
    return this.currenciesService.findAll();
  }

  @ApiOperation({
    summary: 'Find Currency By Id',
  })
  @ApiOkResponse({
    description: '',
    type: CurrencyResponseDto,
  })
  @Get(':id')
  findOne(@Param('id') id: string): Promise<CurrencyResponseDto> {
    return this.currenciesService.findOne(+id);
  }
}
