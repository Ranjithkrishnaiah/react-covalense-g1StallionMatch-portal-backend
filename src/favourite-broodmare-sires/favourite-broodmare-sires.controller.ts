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
import { FavouriteBroodmareSireService } from './favourite-broodmare-sires.service';
import { CreateFavouriteBroodmareSireDto } from './dto/create-favourite-broodmare-sire.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { FavouriteBroodmareSire } from './entities/favourite-broodmare-sire.entity';
import { SearchOptionsDto } from './dto/search-options.dto';
import { ApiPaginatedResponse } from 'src/utils/decorators/api-paginated-response.decorator';
import { PageDto } from 'src/utils/dtos/page.dto';
import { RoleGuard } from 'src/role/role.gaurd';

@ApiTags('Favourite Broodmare Sires')
@Controller({
  path: 'favourite-broodmare-sires',
  version: '1',
})
export class FavouriteBroodmareSiresController {
  constructor(
    private readonly favouriteBroodmareSireService: FavouriteBroodmareSireService,
  ) {}

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create New Favourite Brood-Mare Sire',
  })
  @ApiCreatedResponse({
    description: 'The record has been successfully created.',
  })
  @SetMetadata('api', {
    id: 'FAVOURITEBROODMARESIRES_CREATE',
    method: 'CREATE',
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Post()
  create(
    @Body() createFavouriteBroodmareSireDto: CreateFavouriteBroodmareSireDto,
  ) {
    return this.favouriteBroodmareSireService.create(
      createFavouriteBroodmareSireDto,
    );
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all Favourite Brood-Mare sire',
  })
  @ApiPaginatedResponse(FavouriteBroodmareSire)
  @SetMetadata('api', {
    id: 'FAVOURITEBROODMARESIRES_GET',
    method: 'READ',
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get()
  findAll(
    @Query() pageOptionsDto: SearchOptionsDto,
  ): Promise<PageDto<FavouriteBroodmareSire>> {
    return this.favouriteBroodmareSireService.findAll(pageOptionsDto);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Remove Favourite Brood-Mare Sire',
  })
  @ApiOkResponse({
    description: 'Deleted Successfully',
  })
  @SetMetadata('api', {
    id: 'FAVOURITEBROODMARESIRES_DELETE',
    method: 'DELETE',
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Delete()
  remove(
    @Body() removeFavouriteBroodmareSireDto: CreateFavouriteBroodmareSireDto,
  ) {
    return this.favouriteBroodmareSireService.remove(
      removeFavouriteBroodmareSireDto,
    );
  }
}
