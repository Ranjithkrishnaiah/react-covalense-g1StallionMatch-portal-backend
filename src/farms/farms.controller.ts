import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags
} from '@nestjs/swagger';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { BreederStallionMatchActivityDto } from 'src/breeder-report/dto/breeder-stallion-match-activity.dto';
import { FileUploadUrlDto } from 'src/file-uploads/dto/file-upload-url.dto';
import { CreateMemberSocialShareDto } from 'src/member-social-share/dto/create-member-social-share.dto';
import { PageReferrerDto } from 'src/page-view/dto/page-referrer.dto';
import { RoleGuard } from 'src/role/role.gaurd';
import { Stallion } from 'src/stallions/entities/stallion.entity';
import { ApiPaginatedResponse } from 'src/utils/decorators/api-paginated-response.decorator';
import { PageDto } from 'src/utils/dtos/page.dto';
import { ActivityOptionDto } from './dto/activity-options.dto';
import { CreateFarmDto } from './dto/create-farm.dto';
import { DeleteFarmDto } from './dto/delete-farm.dto';
import { FarmsAnalyticsResDto } from './dto/farm-analytics-res.dto';
import { FarmInfoResDto } from './dto/farm-info-res.dto';
import { FarmMediaListResDto } from './dto/farm-media-list-res.dto';
import { FarmNameSearchDto } from './dto/farm-name-search.dto';
import { GetNamesResDto } from './dto/get-names-res.dto';
import { PriceMinMaxOptionsDto } from './dto/price-min-max-options.dto';
import { PriceRangeResDto } from './dto/price-range-res.dto';
import { PromotedStallionsResDto } from './dto/promoted-stallions-res.dto';
import { SearchByNameResDto } from './dto/search-byname-res.dto';
import { SearchOptionsDto } from './dto/search-options.dto';
import { stallionsSortDto } from './dto/stallions-sort.dto';
import { UpdateFarmGalleryDto } from './dto/update-farm-gallery.dto';
import { UpdateFarmMediaInfoDto } from './dto/update-farm-media-info';
import { UpdateFarmOverviewDto } from './dto/update-farm-overview.dto';
import { UpdateFarmProfileDto } from './dto/update-farm-profile.dto';
import { Farm } from './entities/farm.entity';
import { FarmsService } from './farms.service';
import { FarmGuard } from './guards/farm.guard';
import { SearchStallionNameResponse } from 'src/stallions/dto/search-stallion-name-response.dto';
import { additionalOptionDto } from './dto/additional-option.dto';

@ApiTags('Farms')
@Controller({
  path: 'farms',
  version: '1',
})
export class FarmsController {
  constructor(private readonly farmsService: FarmsService) {}

  @ApiOperation({
    summary: 'Get All Farm Locations',
  })
  @ApiOkResponse({
    description: '',
    isArray: true,
  })
  @Get('/locations')
  async getAllFarmLocations() {
    return this.farmsService.getAllFarmLocations();
  }

  @ApiOperation({
    summary: 'Search Farm By Farm Name',
  })
  @ApiOkResponse({
    description: '',
    type: SearchByNameResDto,
    isArray: true,
  })
  @Get('search-by-name')
  async findFarmsByName(
    @Query() pageOptionsDto: FarmNameSearchDto,
  ): Promise<SearchByNameResDto[]> {
    return this.farmsService.findFarmsByName(pageOptionsDto);
  }

  @ApiOperation({
    summary: 'Get All Farm Names',
  })
  @ApiOkResponse({
    description: '',
    type: GetNamesResDto,
    isArray: true,
  })
  @Get('farm-names')
  getAllFarmNameAndIds(): Promise<GetNamesResDto[]> {
    return this.farmsService.getAllFarmNameAndIds();
  }

  @ApiOperation({
    summary: 'Get Min - Max Stallion Fee Range',
  })
  @ApiOkResponse({
    description: '',
    type: PriceRangeResDto,
  })
  @Get('/price-range')
  async getStallionsMinMaxFee(@Query() pageOptionsDto: PriceMinMaxOptionsDto) {
    return this.farmsService.getStallionsMinMaxFee(pageOptionsDto);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a New Farm',
  })
  @ApiCreatedResponse({
    description: 'Farm created successfully',
  })
  @SetMetadata('api', {
    id: 'FARMS_CREATE',
    method: 'CREATE',
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Post()
  create(@Body() createFarmDto: CreateFarmDto) {
    return this.farmsService.create(createFarmDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Search Farms',
  })
  @ApiPaginatedResponse(Farm)
  async findAll(
    @Query() pageOptionsDto: SearchOptionsDto,
  ): Promise<PageDto<Farm>> {
    return this.farmsService.findAll(pageOptionsDto);
  }

  @ApiOperation({
    summary: 'Farm Activity',
  })
  @ApiOkResponse({
    description: '',
  })
  @SetMetadata('api', {
    id: 'FARMS_GET_FARM_ACTIVITY',
    method: 'GET',
  })
  @Get('/farm-activity')
  getFarmActivity(@Query() searchOption: ActivityOptionDto) {
    return this.farmsService.getFarmActivity(searchOption);
  }

  @ApiOperation({
    summary: 'Get All My Stallions',
  })
  @ApiOkResponse({
    description: '',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Get('my-stallions')
  getAllMyStallions() {
    return this.farmsService.getAllMyStallions();
  }

  @ApiOperation({
    summary: 'Get All Promoted Stallions By Farm',
  })
  @ApiOkResponse({
    description: '',
    type: PromotedStallionsResDto,
    isArray: true,
  })
  @Get(':farmId/promoted-stallions')
  async findPromotedStallions(
    @Param('farmId', new ParseUUIDPipe()) farmId: string,
  ) {
    return this.farmsService.findPromotedStallions(farmId);
  }

  @ApiOperation({
    summary: 'Get All Farm Media by userId',
  })
  @ApiOkResponse({
    description: '',
    type: FarmMediaListResDto,
    isArray: true,
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    id: 'FARMS_GET_ALL_FARMS_MEDIA',
    method: 'READ',
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('media')
  getAllFarmMediaByUserId() {
    return this.farmsService.getAllFarmMediaByUserFavFarms();
  }

  @ApiOperation({
    summary: 'Get All Farm Info By FarmId',
  })
  @ApiOkResponse({
    description: '',
    type: FarmInfoResDto,
  })
  @Get(':farmId')
  findOne(
    @Param('farmId', new ParseUUIDPipe()) farmId: string,
    @Query() searchOptions: additionalOptionDto,
  ) {
    return this.farmsService.getFarmDetails(farmId);
  }

  @ApiOperation({
    summary: 'Get Farm Overview By Id',
  })
  @ApiOkResponse({
    description: '',
  })
  @Get(':farmId/overview')
  findStallionOverview(@Param('farmId', new ParseUUIDPipe()) farmId: string) {
    return this.farmsService.findFarmOverview(farmId);
  }

  /**
   *
   * @param farmId
   * @param pageOptionsDto
   * @returns
   */
  @ApiOperation({
    summary: 'Get All Stallions For a Farm - All users',
  })
  @ApiPaginatedResponse(Stallion)
  @Get(':farmId/farm-stallions')
  getFarmPublicStallions(
    @Param('farmId', new ParseUUIDPipe()) farmId: string,
    @Query() pageOptionsDto: stallionsSortDto,
  ) {
    return this.farmsService.getAllFarmStallions(farmId, pageOptionsDto);
  }

  /**
   * ViewOnly user of a farm or Farm Admin of a farm only can access this end point.
   *
   * @param farmId
   * @param pageOptionsDto
   * @returns
   */
  @ApiOperation({
    summary: 'Get All Stallions By Farm',
  })
  @ApiPaginatedResponse(Stallion)
  @ApiBearerAuth()
  @SetMetadata('api', {
    id: 'FARMS_GET_FARM_STALLIONS',
    method: 'READ',
    farmIdIn: 'params',
    farmKey: 'farmId',
  })
  @UseGuards(JwtAuthenticationGuard, FarmGuard)
  @Get(':farmId/stallions')
  getFarmStallions(
    @Param('farmId', new ParseUUIDPipe()) farmId: string,
    @Query() pageOptionsDto: stallionsSortDto,
  ) {
    return this.farmsService.getAllStallions(farmId, pageOptionsDto);
  }

  @ApiOperation({
    summary: 'Get All Stallions With InBreeding',
  })
  @ApiOkResponse({
    description: '',
    type: SearchStallionNameResponse,
    isArray: true,
  })
  @Get(':farmId/stallions-with-inbreeding')
  getAllStallionsWithInbreeding(
    @Param('farmId', new ParseUUIDPipe()) farmId: string,
  ): Promise<SearchStallionNameResponse[]> {
    return this.farmsService.getAllStallionsWithInbreeding(farmId);
  }

  @ApiOperation({
    summary: 'Get All Stallions Without Pagination',
  })
  @ApiOkResponse({
    description: '',
    type: PromotedStallionsResDto,
    isArray: true,
  })
  @Get(':farmId/stallion-names')
  getAllStallionsWithoutPaging(
    @Param('farmId', new ParseUUIDPipe()) farmId: string,
  ) {
    return this.farmsService.getAllStallionsWithoutPaging(farmId);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Farm - Profile Image Upload Initiation',
  })
  @ApiCreatedResponse({
    description: 'Farm - Profile Image Uploaded successfully',
  })
  @SetMetadata('api', {
    id: 'FARMS_GET_PROFILE_IMAGE_PRESIGNEDURL',
    method: 'READ',
    farmIdIn: 'params',
    farmKey: 'farmId',
  })
  @UseGuards(JwtAuthenticationGuard, FarmGuard)
  @Post(':farmId/profile-image')
  async profileImageUpload(
    @Param('farmId', new ParseUUIDPipe()) farmId: string,
    @Body() data: FileUploadUrlDto,
  ) {
    return await this.farmsService.profileImageUpload(farmId, data);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Farm - Gallery Image Upload Initiation',
  })
  @ApiCreatedResponse({
    description: 'Farm - Gallery Image Uploaded successfully',
  })
  @SetMetadata('api', {
    id: 'FARMS_GET_GALLERY_IMAGE_PRESIGNEDURL',
    method: 'READ',
    farmIdIn: 'params',
    farmKey: 'farmId',
  })
  @UseGuards(JwtAuthenticationGuard, FarmGuard)
  @Post(':farmId/gallery-images')
  async galleryImageUpload(
    @Param('farmId', new ParseUUIDPipe()) farmId: string,
    @Body() data: FileUploadUrlDto,
  ) {
    return await this.farmsService.galleryImageUpload(farmId, data);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Farm - Media Images/Videos Upload Initiation',
  })
  @ApiCreatedResponse({
    description: 'Farm - Media Images/Videos Uploaded successfully',
  })
  @SetMetadata('api', {
    id: 'FARMS_GET_MEDIA_IMAGE_PRESIGNEDURL',
    method: 'READ',
    farmIdIn: 'params',
    farmKey: 'farmId',
  })
  @UseGuards(JwtAuthenticationGuard, FarmGuard)
  @Post(':farmId/media-files')
  async farmMediaFileUpload(
    @Param('farmId', new ParseUUIDPipe()) farmId: string,
    @Body() data: FileUploadUrlDto,
  ) {
    return await this.farmsService.farmMediaFileUpload(farmId, data);
  }

  /**
   * FarmAdmin of a farm and ViewOnly member of a farm only can access
   * this end point.
   * @param farmId
   * @param updateDto
   * @returns
   */
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Farm - Update Profile Data - Screen 1',
  })
  @ApiOkResponse({
    description: 'Farm - Profile Data - Screen 1 Updated Successfully',
  })
  @SetMetadata('api', {
    id: 'FARMS_UPDATE_PROFILE',
    method: 'UPDATE',
    farmIdIn: 'params',
    farmKey: 'farmId',
  })
  @UseGuards(JwtAuthenticationGuard, FarmGuard)
  @Patch(':farmId/profile')
  update(
    @Param('farmId', new ParseUUIDPipe()) farmId: string,
    @Body() updateDto: UpdateFarmProfileDto,
  ) {
    return this.farmsService.profileUpdate(farmId, updateDto);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Farm - Add/Remove Gallery Data - Screen 2',
  })
  @ApiOkResponse({
    description: 'Farm - Gallery Data - Screen 2  Updated Successfully',
  })
  @SetMetadata('api', {
    id: 'FARMS_UPDATE_GALLERY_IMAGES',
    method: 'UPDATE',
    farmIdIn: 'params',
    farmKey: 'farmId',
  })
  @UseGuards(JwtAuthenticationGuard, FarmGuard)
  @Patch(':farmId/gallery-images')
  galleryUpdate(
    @Param('farmId', new ParseUUIDPipe()) farmId: string,
    @Body() updateDto: UpdateFarmGalleryDto,
  ) {
    return this.farmsService.galleryUpdate(farmId, updateDto);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Farm - Update Overview Data - Screen 3',
  })
  @ApiOkResponse({
    description: 'Farm - Overview Data - Screen 3  Updated Successfully',
  })
  @SetMetadata('api', {
    id: 'FARMS_UPDATE_OVERVIEW',
    method: 'UPDATE',
    farmIdIn: 'params',
    farmKey: 'farmId',
  })
  @UseGuards(JwtAuthenticationGuard, FarmGuard)
  @Patch(':farmId/overview')
  overviewUpdate(
    @Param('farmId', new ParseUUIDPipe()) farmId: string,
    @Body() updateDto: UpdateFarmOverviewDto,
  ) {
    return this.farmsService.overviewUpdate(farmId, updateDto);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Farm - Add/Remove/Update Media Data - Screen 4',
  })
  @ApiOkResponse({
    description: 'Farm - Media Data - Screen 4  Updated Successfully',
  })
  @SetMetadata('api', {
    id: 'FARMS_UPDATE_MEDIAS',
    method: 'UPDATE',
    farmIdIn: 'params',
    farmKey: 'farmId',
  })
  @UseGuards(JwtAuthenticationGuard, FarmGuard)
  @Patch(':farmId/medias')
  testimonialUpdate(
    @Param('farmId', new ParseUUIDPipe()) farmId: string,
    @Body() updateDto: UpdateFarmMediaInfoDto,
  ) {
    return this.farmsService.mediaUpdate(farmId, updateDto);
  }

  @ApiOperation({
    summary: 'Get All Farm Gallery Images',
  })
  @ApiOkResponse({
    description: '',
  })
  @Get(':farmId/gallery-images')
  getAllStallionGalleryImages(
    @Param('farmId', new ParseUUIDPipe()) farmId: string,
  ) {
    return this.farmsService.getAllGalleryImages(farmId);
  }

  @ApiOperation({
    summary: 'Get All Farm Media',
  })
  @ApiOkResponse({
    description: '',
    type: FarmMediaListResDto,
    isArray: true,
  })
  @Get(':farmId/media')
  getAllFarmMediaByFarmId(
    @Param('farmId', new ParseUUIDPipe()) farmId: string,
  ) {
    return this.farmsService.getAllFarmMediaByFarmId(farmId);
  }

  @ApiOperation({
    summary: 'Get All Farm Analytics',
  })
  @ApiOkResponse({
    description: '',
    type: FarmsAnalyticsResDto,
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    id: 'FARMS_GET_ANALYTICS',
    method: 'READ',
    farmIdIn: 'query',
    farmKey: 'farmId',
  })
  @UseGuards(JwtAuthenticationGuard, FarmGuard)
  @Post('analytics')
  getFarmAnalytics(@Query() searchDto: BreederStallionMatchActivityDto) {
    return this.farmsService.getFarmAnalytics(searchDto);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get All Farm members by FarmId',
  })
  @ApiOkResponse({
    description: '',
  })
  @SetMetadata('api', {
    id: 'FARMS_GET_ALL_MEMBERS',
    method: 'READ',
    farmIdIn: 'params',
    farmKey: 'farmId',
  })
  @UseGuards(JwtAuthenticationGuard, FarmGuard)
  @Get(':farmId/members')
  getFarmMembers(@Param('farmId', new ParseUUIDPipe()) farmId: string) {
    return this.farmsService.getFarmMembers(farmId);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Remove a Farm',
  })
  @ApiOkResponse({
    description: 'Farm removed successfully',
  })
  @SetMetadata('api', {
    id: 'FARMS_DELETE',
    method: 'DELETE',
    farmIdIn: 'body',
    farmKey: 'farmId',
  })
  @UseGuards(JwtAuthenticationGuard, FarmGuard)
  @Delete()
  remove(@Body() deleteFarmDto: DeleteFarmDto) {
    return this.farmsService.remove(deleteFarmDto);
  }

  @Get(':stallionId/linked')
  @ApiOperation({
    summary: 'Linked Farms list by stallion',
  })
  async linkedFarms(
    @Param('stallionId', new ParseUUIDPipe()) stallionId: string,
  ) {
    return this.farmsService.linkedFarms(stallionId);
  }

  @ApiOperation({
    summary: 'Save Farm page view count',
  })
  @ApiOkResponse({
    description: 'Page view created successfully',
  })
  @Post('farm-page-view/:farmId')
  farmPageView(
    @Param('farmId', new ParseUUIDPipe()) farmId: string,
    @Body() data: PageReferrerDto,
  ) {
    return this.farmsService.farmPageView(farmId, data.referrer);
  }

  @ApiOperation({
    summary: 'Save Farm page view count - Auth',
  })
  @ApiOkResponse({
    description: '',
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    id: 'FARM_PAGE_VIEW',
    method: 'READ',
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Post('farm-page-view-auth/:farmId')
  authFarmPageView(
    @Param('farmId', new ParseUUIDPipe()) farmId: string,
    @Body() data: PageReferrerDto,
  ) {
    return this.farmsService.farmPageView(farmId, data.referrer);
  }

  @ApiOperation({
    summary: 'Save stallion page social share count',
  })
  @ApiOkResponse({
    description: '',
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    id: 'FARM_PAGE_SOCIAL_SHARE',
    method: 'CREATE',
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Post('farm-page-social-share/:farmId')
  authStallionSocialShare(
    @Param('farmId', new ParseUUIDPipe()) farmId: string,
    @Body() data: CreateMemberSocialShareDto,
  ) {
    return this.farmsService.farmSocialShare(farmId, data.socialShareType);
  }

  @ApiOperation({
    summary: 'Get Farms by Country And States',
  })
  @ApiOkResponse({
    description: '',
  })
  @Get('farm-by-location/:location')
  getFarmByCountry(@Param('location') location: string) {
    return this.farmsService.getFarmByCountry(location);
  }
}
