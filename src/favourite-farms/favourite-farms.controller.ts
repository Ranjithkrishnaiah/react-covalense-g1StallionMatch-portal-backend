import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Request,
  Query,
  UseGuards,
  SetMetadata,
} from '@nestjs/common';
import { FavouriteFarmsService } from './favourite-farms.service';
import { CreateFavouriteFarmDto } from './dto/create-favourite-farm.dto';
import { SearchOptionsDto } from './dto/search-options.dto';
import { FavouriteFarm } from './entities/favourite-farm.entity';
import { ApiPaginatedResponse } from 'src/utils/decorators/api-paginated-response.decorator';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { PageDto } from 'src/utils/dtos/page.dto';
import { RoleGuard } from 'src/role/role.gaurd';

@ApiTags('Favourite Farms')
@Controller({
  path: 'favourite-farms',
  version: '1',
})
export class FavouriteFarmsController {
  constructor(private readonly favouriteFarmsService: FavouriteFarmsService) {}

  @ApiOperation({
    summary: 'Add Farm to Favourite',
  })
  @ApiCreatedResponse({
    description: 'The record has been successfully created.',
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    id: 'FAVOURITEFARMS_CREATE',
    method: 'CREATE',
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Post()
  create(@Body() createFavouriteFarmDto: CreateFavouriteFarmDto) {
    return this.favouriteFarmsService.create(createFavouriteFarmDto);
  }

  @ApiOperation({
    summary: 'Get All Favourite Farms By Member',
  })
  @ApiPaginatedResponse(FavouriteFarm)
  @ApiBearerAuth()
  @SetMetadata('api', {
    id: 'FAVOURITEFARMS_GET',
    method: 'READ',
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get()
  findAll(
    @Request() request,
    @Query() pageOptionsDto: SearchOptionsDto,
  ): Promise<PageDto<FavouriteFarm>> {
    return this.favouriteFarmsService.findAll(request.user, pageOptionsDto);
  }

  @ApiOperation({
    summary: 'Remove Farm to Favourite',
  })
  @ApiOkResponse({
    description: 'Removed Favourite Farm Successfully',
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    id: 'FAVOURITEFARMS_DELETE',
    method: 'DELETE',
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Delete()
  remove(@Body() removeFavouriteFarmDto: CreateFavouriteFarmDto) {
    return this.favouriteFarmsService.remove(removeFavouriteFarmDto);
  }
}
