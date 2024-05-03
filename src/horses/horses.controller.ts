import {
  ParseUUIDPipe,
  Controller,
  Get,
  UseGuards,
  Param,
  Query,
  SetMetadata,
} from '@nestjs/common';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { HorsesService } from './horses.service';
import { HorseSearchDto } from './dto/horse-search.dto';
import { HorseCountsDto } from './dto/horse-counts.dto';
import { HorseNameDto } from './dto/horse-name.dto';
import { HorsePedigreeResponseDto } from './dto/horse-pedigree-response.dto';
import { RoleGuard } from 'src/role/role.gaurd';
import { HorseModalResponseDto } from './dto/horse-modal-details.dto';

@ApiTags('Horses')
@Controller({
  path: 'horses',
  version: '1',
})
export class HorsesController {
  constructor(private readonly horsesService: HorsesService) {}

  @ApiOperation({
    summary: 'Get the Mare Pedigree Data',
  })
  @ApiOkResponse({
    description: '',
    type: HorsePedigreeResponseDto,
  })
  @Get('mare/:mareId/pedigree')
  async getPedigree(@Param('mareId', new ParseUUIDPipe()) mareId: string) {
    return await this.horsesService.getPedigree(mareId, 'F', 'tree');
  }

  @ApiOperation({
    summary: 'Get Stake Details By Id',
  })
  @ApiOkResponse({
    description: '',
  })
  @Get(':horseId/stakes')
  async getHorseStakeDetails(
    @Param('horseId', new ParseUUIDPipe()) horseId: string,
  ) {
    return await this.horsesService.getHorseStakeDetails(horseId);
  }

  // @ApiOperation({
  //   summary: 'Get the Horse Pedigree Data',
  // })
  // @ApiOkResponse({
  //   description: '',
  //   type: HorsePedigreeResponseDto,
  // })
  // @Get(':horseId/pedigree')
  // async getRaceHorsePedigree(@Param('horseId', new ParseUUIDPipe()) horseId: string) {
  //   return await this.horsesService.getHorsePedigree(horseId);
  // }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all the compatible stallions by given broodmareSireId',
  })
  @ApiOkResponse({
    description: '',
    isArray: true,
  })
  @SetMetadata('api', {
    id: 'HORSES_GET_COMPATIBLE_STALLIONS_BY_BROODMARE_SIRES',
    method: 'READ',
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get(':broodmareSireId/compatible-stallions')
  async getCompatibleStallions(
    @Param('broodmareSireId', new ParseUUIDPipe()) broodmareSireId: string,
  ) {
    return this.horsesService.getCompatibleStallions(broodmareSireId);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Get all the counts of Favorite stallions, Farms, Broodmare sires and Mares for a member',
  })
  @ApiOkResponse({
    description: '',
    type: HorseCountsDto,
  })
  @SetMetadata('api', {
    id: 'HORSES_GET_ALL_COUNTS',
    method: 'READ',
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('all-counts')
  async allCounts(): Promise<HorseCountsDto> {
    return this.horsesService.allCounts();
  }

  @ApiOperation({
    summary:
      'Get all the HorseId and Name - flitered by name, sex, country - Used in Add Stallion Modal',
  })
  @ApiOkResponse({
    description: '',
    type: HorseNameDto,
    isArray: true,
  })
  @Get()
  async findHorses(
    @Query() searchOptions: HorseSearchDto,
  ): Promise<HorseNameDto[]> {
    return this.horsesService.findHorses(searchOptions);
  }

  @ApiOperation({
    summary: 'Get all the Horse information Used in - Stallion Modal',
  })
  @ApiOkResponse({
    description: '',
    type: HorseModalResponseDto,
    isArray: false,
  })
  @Get('/:horseId/horse-modal-details')
  async findHorse(
    @Param('horseId', new ParseUUIDPipe()) horseId: string,
  ): Promise<HorseModalResponseDto> {
    return this.horsesService.findHorseDetails(horseId);
  }
}
