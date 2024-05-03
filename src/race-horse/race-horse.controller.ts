import {
  Body,
  Controller, Get, Param, ParseUUIDPipe, Post, Query
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { HorsePedigreeResponseDto } from 'src/horses/dto/horse-pedigree-response.dto';
import { RaceHorseService } from './race-horse.service';
import { ApiPaginatedResponse } from 'src/utils/decorators/api-paginated-response.decorator';
import { SearchStakeWinnerComparisonOptionsDto } from './dto/search-stake-winner-comparison-options.dto';
import { SmSearchProfileDetailsOptionsDto } from './dto/sm-search-profile-details-options.dto';
import { RaceHorseNameSearchDto } from './dto/race-horse-name-search.dto';
import { ValidateRaceHorseUrlDto } from './dto/validate-race-horse-url.dto';

@ApiTags('Race Horse')
@Controller({
  path: 'race-horse',
  version: '1',
})
export class RaceHorseController {
  constructor(private readonly raceHorseService: RaceHorseService, ) {}

  @ApiOperation({
    summary: 'Get Stakes Winner Comparison',
  })
  @ApiOkResponse({
    description: '',
  })
  @Get('stakes-winner-comparison')
  async getStakesWinnerComparison(
    @Query() searchOptionsDto: SearchStakeWinnerComparisonOptionsDto,
  ) {
    return this.raceHorseService.getStakesWinnerComparison(
      searchOptionsDto,
    );
  }
  
  @ApiOperation({
    summary: 'Get Aptitude, Age And Distance Profiles',
  })
  @ApiOkResponse({
    description: '',
  })
  @Get('smsearch-profile-details')
  async getSmsearchProfileDetails(
    @Query() searchOptionsDto: SmSearchProfileDetailsOptionsDto,
  ) {
    return this.raceHorseService.getSmsearchProfileDetails(
      searchOptionsDto,
    );
  }

  @ApiOperation({
    summary: 'Get Aptitude, Age And Distance Profiles',
  })
  @ApiOkResponse({
    description: '',
  })
  @Get('search-racehorse-byname')
  async getRaceHorseByName(
    @Query() searchOptionsDto: RaceHorseNameSearchDto,
  ) {
    return this.raceHorseService.getRaceHorseByName(
      searchOptionsDto,
    );
  }

  @ApiOperation({
    summary: 'Get the Race Horse Pedigree',
  })
  @ApiOkResponse({
    description: '',
    type: HorsePedigreeResponseDto,
  })
  @Get(':horseId/pedigree')
  async getRaceHorsePedigree(@Param('horseId', new ParseUUIDPipe()) horseId: string) {
    return await this.raceHorseService.getRaceHorsePedigree(horseId);
  }

  @ApiOperation({
    summary: 'Get Pedigree Overlap - By Level',
  })
  @ApiOkResponse({
    description: '',
  })
  @Get('pedigree-overlap/:horseId/:swId/:generation')
  async getPedigreeOverlapDetails(
    @Param('horseId', new ParseUUIDPipe()) horseId: string,
    @Param('swId', new ParseUUIDPipe()) swId: string,
    @Param('generation') generation: number,
  ) {
    return await this.raceHorseService.getPedigreeOverlapDetails(
      horseId,
      swId,
      generation,
    );
  }

  @ApiOperation({
    summary: 'Validate the Race Horse Url',
  })
  @ApiOkResponse({
    description: '',
  })
  @Post('validate-url')
  async validateRaceHorseUrl(
    @Body() data: ValidateRaceHorseUrlDto,
  ) {
    return await this.raceHorseService.validateRaceHorseUrl(data);
  }
}
