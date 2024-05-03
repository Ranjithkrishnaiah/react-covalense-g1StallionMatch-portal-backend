import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  UseGuards,
  Query,
  SetMetadata,
} from '@nestjs/common';
import { FavouriteStallionsService } from './favourite-stallions.service';
import { CreateFavouriteStallionDto } from './dto/create-favourite-stallion.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { FavouriteStallion } from './entities/favourite-stallion.entity';
import { SearchOptionsDto } from './dto/search-options.dto';
import { PageDto } from 'src/utils/dtos/page.dto';
import { ApiPaginatedResponse } from 'src/utils/decorators/api-paginated-response.decorator';
import { RoleGuard } from 'src/role/role.gaurd';

@ApiTags('Favourite Stallions')
@Controller({
  path: 'favourite-stallions',
  version: '1',
})
export class FavouriteStallionsController {
  constructor(
    private readonly favouriteStallionsService: FavouriteStallionsService,
  ) {}

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Add a Stallion to Favourite - For Member',
  })
  @ApiCreatedResponse({
    description: 'The record has been successfully created.',
  })
  /* @Roles(RoleEnum.farmadmin, RoleEnum.farmmember, RoleEnum.breeder)
  @UseGuards(JwtAuthenticationGuard, RolesGuard) */
  @SetMetadata('api', {
    id: 'FAVOURITESTALLIONS_CREATE',
    method: 'CREATE',
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Post()
  create(@Body() createFavouriteStallionDto: CreateFavouriteStallionDto) {
    return this.favouriteStallionsService.create(createFavouriteStallionDto);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all Favourite Stallions - For Member',
  })
  @ApiPaginatedResponse(FavouriteStallion)
  /* @Roles(RoleEnum.farmadmin, RoleEnum.farmmember, RoleEnum.breeder)
  @UseGuards(JwtAuthenticationGuard, RolesGuard) */
  @SetMetadata('api', {
    id: 'FAVOURITESTALLIONS_GET',
    method: 'READ',
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get()
  findAll(
    @Query() pageOptionsDto: SearchOptionsDto,
  ): Promise<PageDto<FavouriteStallion>> {
    return this.favouriteStallionsService.findAll(pageOptionsDto);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Favourite stallions with race details - For Member',
  })
  @ApiPaginatedResponse(FavouriteStallion)
  /* @Roles(RoleEnum.farmadmin, RoleEnum.farmmember, RoleEnum.breeder)
  @UseGuards(JwtAuthenticationGuard, RolesGuard) */
  @SetMetadata('api', {
    id: 'FAVOURITESTALLIONS_GET_WITH_RACE_DETAILS',
    method: 'READ',
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('with-race-details')
  findAllWithRaceDetails(
    @Query() pageOptionsDto: SearchOptionsDto,
  ): Promise<PageDto<FavouriteStallion>> {
    return this.favouriteStallionsService.findAllWithRaceDetails(
      pageOptionsDto,
    );
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Remove a Stallion from Favourite - For Member',
  })
  @ApiOkResponse({
    description: 'Deleted Successfully',
  })
  /* @Roles(RoleEnum.farmadmin, RoleEnum.farmmember, RoleEnum.breeder)
  @UseGuards(JwtAuthenticationGuard, RolesGuard) */
  @SetMetadata('api', {
    id: 'FAVOURITESTALLIONS_DELETE',
    method: 'DELETE',
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Delete()
  remove(@Body() deleteFavouriteStallionDto: CreateFavouriteStallionDto) {
    return this.favouriteStallionsService.remove(deleteFavouriteStallionDto);
  }
}
