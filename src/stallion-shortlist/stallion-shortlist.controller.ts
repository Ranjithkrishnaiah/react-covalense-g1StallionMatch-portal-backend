import {
  Controller,
  Get,
  Post,
  Body,
  Request,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
  Query,
  SetMetadata,
} from '@nestjs/common';
import { StallionShortlistService } from './stallion-shortlist.service';
import { CreateStallionShortlistDto } from './dto/create-stallion-shortlist.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from 'src/member-roles/roles.decorator';
import { RoleEnum } from 'src/member-roles/roles.enum';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { RolesGuard } from 'src/member-roles/roles.guard';
import { SearchOptionsDto } from './dto/search-options.dto';
import { GuestSearchOptionsDto } from './dto/guest-search-options.dto';
import { PriceMinMaxOptionsDto } from 'src/stallions/dto/price-min-max-options.dto';
import { GuestPriceMinMaxOptionsDto } from './dto/guest-price-min-max-options.dto';
import { StallionShortlist } from './entities/stallion-shortlist.entity';
import { Horse } from 'src/horses/entities/horse.entity';
import { ApiPaginatedResponse } from 'src/utils/decorators/api-paginated-response.decorator';
import { PageDto } from 'src/utils/dtos/page.dto';
import { GuestPriceMinMaxOptionsDtoRes } from './dto/guest-price-min-max-optio-res.dto';
import { RoleGuard } from 'src/role/role.gaurd';

@ApiTags('Stallion Shortlist')
@Controller({
  path: 'stallion-shortlist',
  version: '1',
})
export class StallionShortlistController {
  constructor(
    private readonly stallionShortlistService: StallionShortlistService,
  ) {}

  @ApiOperation({
    summary: 'Add a Stallion to Shortlist',
  })
  @ApiCreatedResponse({
    description: 'The record has been successfully created.',
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    id: 'STALLIONSHORTLIST_CREATE',
    method: 'CREATE',
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Post()
  create(@Body() createStallionShortlist: CreateStallionShortlistDto) {
    return this.stallionShortlistService.create(createStallionShortlist);
  }

  @ApiOperation({
    summary: 'Get all Shortlisted Stallions for a loggedIn User',
  })
  @ApiPaginatedResponse(StallionShortlist)
  @ApiBearerAuth()
  @SetMetadata('api', {
    id: 'STALLIONSHORTLIST_GET',
    method: 'READ',
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get()
  findAll(
    @Query() searchOptionsDto: SearchOptionsDto,
  ): Promise<PageDto<StallionShortlist>> {
    return this.stallionShortlistService.findAll(searchOptionsDto);
  }

  @ApiOperation({
    summary: 'Get all Shortlisted Stallions for a guest User',
  })
  @ApiPaginatedResponse(StallionShortlist)
  @Get('/guest')
  findAllGuest(
    @Query() searchOptionsDto: GuestSearchOptionsDto,
  ): Promise<PageDto<StallionShortlist>> {
    return this.stallionShortlistService.findAllGuest(searchOptionsDto);
  }

  @ApiOperation({
    summary: 'Delete a Shortlisted Stallions from list',
  })
  @ApiOkResponse({
    description: '',
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    id: 'STALLIONSHORTLIST_DELETE',
    method: 'DELETE',
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Delete(':stallionId')
  remove(@Param('stallionId', new ParseUUIDPipe()) stallionId: string) {
    return this.stallionShortlistService.remove(stallionId);
  }

  @ApiOperation({
    summary:
      'Get all Shortlisted Stallions Min Max Price Range for a loggedIn User',
  })
  @ApiOkResponse({
    description: '',
    type: GuestPriceMinMaxOptionsDtoRes,
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    id: 'STALLIONSHORTLIST_GET_MEMBER_PRICERANGE',
    method: 'READ',
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('/member/price-range')
  async getMemberStallionMinMax(
    @Query() searchOptionsDto: PriceMinMaxOptionsDto,
  ): Promise<GuestPriceMinMaxOptionsDtoRes> {
    return this.stallionShortlistService.getMemberStallionShortlistsMinMaxFee(
      searchOptionsDto,
    );
  }

  @ApiOperation({
    summary:
      'Get all Shortlisted Stallions Min Max Price Range for a Guest User',
  })
  @ApiOkResponse({
    description: '',
    type: GuestPriceMinMaxOptionsDtoRes,
  })
  @Get('/guest/price-range')
  async getGuestStallionMinMax(
    @Query() searchOptionsDto: GuestPriceMinMaxOptionsDto,
  ): Promise<GuestPriceMinMaxOptionsDtoRes> {
    return this.stallionShortlistService.getGuestStallionShortlistsMinMaxFee(
      searchOptionsDto,
    );
  }

  @ApiOperation({
    summary: 'Get all Shortlisted Stallion Ids for a loggedIn User',
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    id: 'STALLIONSHORTLIST_GET_IDS',
    method: 'READ',
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('ids')
  getAllShortlistedStallions(): Promise<StallionShortlist[]> {
    return this.stallionShortlistService.getAllShortlistedStallions();
  }
}
