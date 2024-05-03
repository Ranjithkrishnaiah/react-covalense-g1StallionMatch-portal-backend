import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CountryResponseDto } from './dto/country-response.dto';
import { CountryWithStateResponseDto } from './dto/country-with-state-response.dto';
import { CountrySearchDto } from './dto/country-search.dto';
import { CountryService } from './service/country.service';

@ApiTags('Countries')
@Controller({
  path: 'countries',
  version: '1',
})
export class CountryController {
  constructor(private countryService: CountryService) {}

  @ApiOperation({
    summary: 'Get All Countries',
  })
  @ApiOkResponse({
    description: '',
    type: CountryResponseDto,
    isArray: true,
  })
  @Get()
  getAllCountries(
    @Query() countrySearchDto: CountrySearchDto,
  ): Promise<CountryResponseDto[]> {
    return this.countryService.getAllCountries(countrySearchDto);
  }

  @ApiOperation({
    summary: 'Get All Countries along with States',
  })
  @ApiOkResponse({
    description: '',
    type: CountryWithStateResponseDto,
  })
  @Get('with-states')
  getAllCountriesWithStates(): Promise<CountryWithStateResponseDto> {
    return this.countryService.getAllCountriesWithStates();
  }

  @ApiOperation({
    summary: 'Get All Countries List For Footer (Stallions/Farms by Country)',
  })
  @ApiOkResponse({
    description: '',
    isArray: true,
  })
  @Get('for-footer')
  getAllCountriesForFooter() {
    return this.countryService.getCountryListForFooterDisplay();
  }
}
