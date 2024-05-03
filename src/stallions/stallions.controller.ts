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
  Request,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { PresignedUrlDto } from 'src/auth/dto/presigned-url.dto';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { FarmGuard } from 'src/farms/guards/farm.guard';
import { FileUploadUrlDto } from 'src/file-uploads/dto/file-upload-url.dto';
import { Horse } from 'src/horses/entities/horse.entity';
import { CreateMemberSocialShareDto } from 'src/member-social-share/dto/create-member-social-share.dto';
import { PageReferrerDto } from 'src/page-view/dto/page-referrer.dto';
import { RoleGuard } from 'src/role/role.gaurd';
import { StallionGuard } from 'src/stallion-gaurd/stallion.gaurd';
import { CreateStallionServiceFeeDto } from 'src/stallion-service-fees/dto/create-stallion-service-fee.dto';
import { CreateStallionDto } from 'src/stallions/dto/create-stallion.dto';
import { ApiPaginatedResponse } from 'src/utils/decorators/api-paginated-response.decorator';
import { PageDto } from 'src/utils/dtos/page.dto';
import { AlternateMatingSuggestionsDto } from './dto/alternate-mating-suggestions.dto';
import { AuthStallionInfoResponseDto } from './dto/auth-stallion-info-response.dto';
import { DamNameSearchDto } from './dto/dam-name-search.dto';
import { DamSireNameSearchDto } from './dto/dam-sire-name-search.dto';
import { deleteStallionDto } from './dto/delete-stallion.dto';
import { FeeRangeSearchDto } from './dto/fee-range-search.dto.';
import { GalleryImagesResponse } from './dto/gallery-images-response.dto';
import { GrandSireNameSearchDto } from './dto/grand-sire-name-search.dto';
import { HypoMatingAdditionalInfoDto } from './dto/hypo-mating-additional-info.dto';
import { MareNameSearchDto } from './dto/mare-name-search.dto';
import { PopularStallionResponseDto } from './dto/popular-stallion-response.dto';
import { PriceMinMaxOptionsDto } from './dto/price-min-max-options.dto';
import { PriceRangeResponseDto } from './dto/price-range-response.dto';
import { SearchDamNameResponse } from './dto/search-dam-name-response.dto';
import { SearchInFeeRangeResponseDto } from './dto/search-in-fee-range-response.dto';
import { SearchMareNameResponse } from './dto/search-mare-name-response.dto';
import { SearchOptionsDto } from './dto/search-options.dto';
import { SearchPopularStallionsDto } from './dto/search-popular-stallions.dto';
import { SearchSimilarStallionDto } from './dto/search-similar-stallion.dto';
import { SearchSireNameResponse } from './dto/search-sire-name-response.dto';
import { SearchStakeWinnerComparisonOptionsDto } from './dto/search-stake-winner-comparison-options.dto';
import { SearchStallionNameResponse } from './dto/search-stallion-name-response.dto';
import { ServiceFeeByYearResponseDto } from './dto/service-fee-by-year-response.dto';
import { SireNameSearchDto } from './dto/sire-name-search.dto';
import { SmSearchProfileDetailsOptionsDto } from './dto/sm-search-profile-details-options.dto';
import { StakesProgenyPageOptionsDto } from './dto/stakes-progeny-page-options.dto';
import { StallionInfoResponseDto } from './dto/stallion-info-response.dto';
import { StallionNameSearchDto } from './dto/stallion-name-search.dto';
import { StallionPedigreeResponseDto } from './dto/stallion-pedigree-response.dto';
import { StallionTestimonialResponse } from './dto/stallion-testimonial-response.dto';
import { UpdateStallionGalleryDto } from './dto/update-stallion-gallery.dto';
import { UpdateStallionOverviewDto } from './dto/update-stallion-overview.dto';
import { UpdateStallionProfileDto } from './dto/update-stallion-profile.dto';
import { UpdateStallionTestimonialDto } from './dto/update-stallion-testimonial';
import { YearListResponseDto } from './dto/year-list-response.dto';
import { Stallion } from './entities/stallion.entity';
import { StallionSearchService } from './stallion-search.service';
import { StallionsService } from './stallions.service';
import { additionalOptionDto } from 'src/farms/dto/additional-option.dto';
import { footerSerachResponse } from './dto/footer-search-response.dto';
import { footerSearchDto } from './dto/footer-search.dto';
import { currencyDto } from './dto/report-currency.dto';
@ApiTags('Stallions')
@Controller({
  path: 'stallions',
  version: '1',
})
export class StallionsController {
  constructor(
    private readonly stallionsService: StallionsService,
    private readonly stallionSearchService: StallionSearchService,
  ) {}

  @ApiOperation({
    summary: 'Get All Stallion Locations',
  })
  @ApiOkResponse({
    description: '',
    isArray: true,
  })
  @Get('locations')
  async getAllStallionLocations() {
    return this.stallionsService.getAllStallionLocations();
  }

  @ApiOperation({
    summary: 'Search Stallion Names',
  })
  @ApiOkResponse({
    description: '',
    type: SearchStallionNameResponse,
    isArray: true,
  })
  @Get('search-stallion-names')
  async findStallionsByName(
    @Query() searchOptionsDto: StallionNameSearchDto,
  ): Promise<SearchStallionNameResponse[]> {
    return this.stallionsService.findStallionsByName(searchOptionsDto);
  }

  @ApiOperation({
    summary: 'Search Stallion And Farms - Footer Search',
  })
  @ApiOkResponse({
    description: '',
    type: footerSerachResponse,
    isArray: true,
  })
  @Get('footer-search')
  async footerSearch(
    @Query() searchOptionsDto: footerSearchDto,
  ): Promise<footerSerachResponse[]> {
    return this.stallionsService.footerSearch(searchOptionsDto);
  }

  @ApiOperation({
    summary: 'Get Stallions Searched By Users',
  })
  @ApiOkResponse({
    description: '',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Get('searched-by-users')
  async findStallionsSearchedByUsers() {
    return this.stallionsService.findStallionsSearchedByUsers();
  }

  @ApiOperation({
    summary: 'Search Mare Names',
  })
  @ApiOkResponse({
    description: '',
    type: SearchMareNameResponse,
    isArray: true,
  })
  @Get('search-mare-names')
  async findMaresByName(
    @Query() searchOptionsDto: MareNameSearchDto,
  ): Promise<SearchMareNameResponse[]> {
    return this.stallionsService.findMaresByName(searchOptionsDto);
  }

  @ApiOperation({
    summary: 'Search Stallion Sire Names',
  })
  @ApiOkResponse({
    description: '',
    type: SearchSireNameResponse,
    isArray: true,
  })
  @Get('search-sire-name')
  async findSiresByName(
    @Query() searchOptionsDto: SireNameSearchDto,
  ): Promise<SearchSireNameResponse[]> {
    return this.stallionsService.findSiresByName(searchOptionsDto);
  }

  @ApiOperation({
    summary: 'Search Stallion Dam Sire Names',
  })
  @ApiOkResponse({
    description: '',
    type: SearchDamNameResponse,
    isArray: true,
  })
  @Get('search-dam-sire-name')
  async findDamSireByName(
    @Query() searchOptionsDto: DamSireNameSearchDto,
  ): Promise<SearchDamNameResponse[]> {
    return this.stallionsService.findDamSireByName(searchOptionsDto);
  }

  @ApiOperation({
    summary: 'Get My Dam Sire Searched',
  })
  @ApiOkResponse({
    description: 'Get My Dam Sire Searched',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Get('my-damsires-searched')
  async findMyDamSireBySearched(): Promise<SearchDamNameResponse[]> {
    return this.stallionsService.findMyDamSireBySearched();
  }

  @ApiOperation({
    summary: 'Search Stallion Grand Sire Names',
  })
  @ApiOkResponse({
    description: '',
    type: SearchDamNameResponse,
    isArray: true,
  })
  @Get('search-grand-sire-name')
  async findGrandSireByName(
    @Query() searchOptionsDto: GrandSireNameSearchDto,
  ): Promise<SearchDamNameResponse[]> {
    return this.stallionsService.findGrandSireByName(searchOptionsDto);
  }

  @ApiOperation({
    summary: 'Search Stallion Dam Names',
  })
  @ApiOkResponse({
    description: '',
    type: SearchDamNameResponse,
    isArray: true,
  })
  @Get('search-dam-name')
  async findDamsByName(
    @Query() searchOptionsDto: DamNameSearchDto,
  ): Promise<SearchDamNameResponse[]> {
    return this.stallionsService.findDamsByName(searchOptionsDto);
  }

  @ApiOperation({
    summary: 'Search Stallion In Fee Range',
  })
  @ApiOkResponse({
    description: '',
    type: SearchInFeeRangeResponseDto,
    isArray: true,
  })
  @Get('search-in-fee-range')
  async findStallionsInFeeRange(@Query() searchOptionsDto: FeeRangeSearchDto) {
    return this.stallionsService.findStallionsInFeeRange(searchOptionsDto);
  }

  @ApiOperation({
    summary: 'get stallions min and max price',
  })
  @ApiOkResponse({
    description: '',
  })
  @Get('min-max-price')
  async minMaxPrice(@Query() searchOptionsDto: SearchOptionsDto) {
    return this.stallionsService.minMaxPrice(searchOptionsDto);
  }

  @ApiOperation({
    summary: 'Get All Years List - Year to Stud',
  })
  @ApiOkResponse({
    description: '',
    type: YearListResponseDto,
    isArray: true,
  })
  @Get('year-to-stud')
  async getYearToStud(): Promise<YearListResponseDto[]> {
    return this.stallionsService.getYearToStudList();
  }

  @ApiOperation({
    summary: 'Get All Years List - Year to Retired',
  })
  @ApiOkResponse({
    description: '',
    type: YearListResponseDto,
    isArray: true,
  })
  @Get('year-to-retired')
  async getYeartoRetired(): Promise<YearListResponseDto[]> {
    return this.stallionsService.getYearToRetiredList();
  }

  @ApiOperation({
    summary: 'Get All Stallions By Search',
  })
  @ApiPaginatedResponse(Stallion)
  @Get()
  async findAll(
    @Query() searchOptionsDto: SearchOptionsDto,
  ): Promise<PageDto<Stallion>> {
    return this.stallionsService.findAll(searchOptionsDto);
  }

  @ApiOperation({
    summary: 'Get Aptitude, Age And Distance Profiles',
  })
  @ApiOkResponse({
    description: '',
  })
  @ApiPaginatedResponse(Horse)
  @Get('smsearch-profile-details')
  async getSmsearchProfileDetails(
    @Query() searchOptionsDto: SmSearchProfileDetailsOptionsDto,
  ) {
    return this.stallionSearchService.getSmsearchProfileDetails(
      searchOptionsDto,
    );
  }

  @ApiOperation({
    summary: 'Get Stakes Winner Comparison',
  })
  @ApiOkResponse({
    description: '',
  })
  @ApiPaginatedResponse(Horse)
  @Get('stakes-winner-comparison')
  async getStakesWinnerComparison(
    @Query() searchOptionsDto: SearchStakeWinnerComparisonOptionsDto,
  ) {
    return this.stallionSearchService.getStakesWinnerComparison(
      searchOptionsDto,
    );
  }

  @ApiOperation({
    summary: 'Get Stallion Search Alternate Mating Suggestions',
  })
  @ApiOkResponse({
    description: '',
  })
  @ApiPaginatedResponse(Horse)
  @Get('alternate-mating-suggestions')
  async getAlternateMatingSuggestions(
    @Query() searchOptionsDto: AlternateMatingSuggestionsDto,
  ) {
    return this.stallionSearchService.getAlternateMatingSuggestions(
      searchOptionsDto,
    );
  }

  @ApiOperation({
    summary: 'Get All Stallions By Location',
  })
  @ApiOkResponse({
    description: 'Get All Stallions By CountryId and StateId',
  })
  @Get(':countryId/:stateId/by-location')
  async findAllByLocation(
    @Param('countryId') countryId: number,
    @Param('stateId') stateId: number,
  ) {
    return this.stallionsService.findAllByLocation({
      countryId: countryId,
      stateId: stateId,
    });
  }

  @ApiOperation({
    summary: 'Get Price Range - Min/Max',
  })
  @ApiOkResponse({
    description: '',
    type: PriceRangeResponseDto,
  })
  @Get('price-range')
  async getStallionMinMax(
    @Query() searchOptionsDto: PriceMinMaxOptionsDto,
  ): Promise<PriceRangeResponseDto> {
    return this.stallionsService.getStallionsMinMaxFee(searchOptionsDto);
  }

  @ApiOperation({
    summary: 'Get Similar Stallions',
  })
  @ApiOkResponse({
    description: '',
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    id: 'STALLIONS_GET_SIMILAR_STALLIONS',
    method: 'READ',
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('similar-stallions')
  getSimilarStallion(@Query() searchOptionsDto: SearchSimilarStallionDto) {
    return this.stallionsService.getSimilarStallion(searchOptionsDto);
  }

  @ApiOperation({
    summary: 'Get Popular Stallions',
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    id: 'STALLIONS_GET_POPULAR_STALLIONS',
    method: 'READ',
  })
  @ApiOkResponse({
    description: '',
    type: PopularStallionResponseDto,
    isArray: true,
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('popular-stallions')
  findPopularStallions(
    @Request() request,
    @Query() searchOptionsDto: SearchPopularStallionsDto,
  ): Promise<PageDto<PopularStallionResponseDto[]>> {
    return this.stallionsService.findPopularStallions(
      request.user,
      searchOptionsDto,
    );
  }

  @ApiOperation({
    summary: 'Stallion By Id',
  })
  @ApiOkResponse({
    description: '',
    type: StallionInfoResponseDto,
  })
  @Get(':stallionId')
  findOne(
    @Param('stallionId', new ParseUUIDPipe()) stallionId: string,
    @Query() searchOptions: additionalOptionDto,
  ): Promise<StallionInfoResponseDto> {
    let stallion = this.stallionsService.getCompleteStallionInfo(stallionId);
    return stallion;
  }

  @ApiOperation({
    summary: 'Get Stallion Connected Farms',
  })
  @ApiOkResponse({
    description: '',
    isArray: true,
  })
  @Get(':stallionId/farms')
  getStallionFarms(
    @Param('stallionId', new ParseUUIDPipe()) stallionId: string,
  ): Promise<StallionTestimonialResponse[]> {
    return this.stallionsService.getStallionFarms(stallionId);
  }

  @ApiOperation({
    summary: 'Get Stallion Overview By Id',
  })
  @ApiOkResponse({
    description: '',
  })
  @Get(':stallionId/overview')
  findStallionOverview(
    @Param('stallionId', new ParseUUIDPipe()) stallionId: string,
  ) {
    return this.stallionsService.findStallionOverview(stallionId);
  }

  /* findStallionInfo after login */
  @ApiOperation({
    summary: 'Stallions By Id - For LoggedIn User',
  })
  @ApiOkResponse({
    description: '',
    type: AuthStallionInfoResponseDto,
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    id: 'STALLIONS_GET_INFO',
    method: 'READ',
    stallionIn: 'params',
    stallionKey: 'stallionId',
  })
  @UseGuards(JwtAuthenticationGuard, StallionGuard)
  @Get(':stallionId/stallion-info')
  findStallionInfo(
    @Param('stallionId', new ParseUUIDPipe()) stallionId: string,
  ): Promise<AuthStallionInfoResponseDto> {
    let stallion = this.stallionsService.findStallionInfo(stallionId);
    return stallion;
  }

  @ApiOperation({
    summary: 'Stallion ProfileImage - Get Presigned Url',
  })
  @ApiOkResponse({
    description: '',
    type: PresignedUrlDto,
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    id: 'STALLIONS_GET_PROFILE_IMAGE_PRESIGNEDURL',
    method: 'READ',
    stallionIn: 'params',
    stallionKey: 'stallionId',
  })
  @UseGuards(JwtAuthenticationGuard, StallionGuard)
  @Post(':stallionId/profile-image')
  async profileImageUpload(
    @Param('stallionId', new ParseUUIDPipe()) stallionId: string,
    @Body() data: FileUploadUrlDto,
  ): Promise<PresignedUrlDto> {
    return await this.stallionsService.profileImageUpload(stallionId, data);
  }

  @ApiOperation({
    summary: 'Stallion Gallery image - Get Presigned Url',
  })
  @ApiOkResponse({
    description: '',
    type: PresignedUrlDto,
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    id: 'STALLIONS_GET_GALLERY_IMAGE_PRESIGNEDURL',
    method: 'READ',
    stallionIn: 'params',
    stallionKey: 'stallionId',
  })
  @UseGuards(JwtAuthenticationGuard, StallionGuard)
  @Post(':stallionId/gallery-images')
  async galleryImageUpload(
    @Param('stallionId', new ParseUUIDPipe()) stallionId: string,
    @Body() data: FileUploadUrlDto,
  ): Promise<PresignedUrlDto> {
    return await this.stallionsService.galleryImageUpload(stallionId, data);
  }

  @ApiOperation({
    summary: 'Stallion Profile - Update',
  })
  @ApiOkResponse({
    description: '',
    type: StallionInfoResponseDto,
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    id: 'STALLIONS_UPDATE_STALLION_PROFILE',
    method: 'UPDATE',
    stallionIn: 'params',
    stallionKey: 'stallionId',
  })
  @UseGuards(JwtAuthenticationGuard, StallionGuard)
  @Patch(':stallionId/profile')
  profileUpdate(
    @Param('stallionId', new ParseUUIDPipe()) stallionId: string,
    @Body() updateDto: UpdateStallionProfileDto,
  ): Promise<StallionInfoResponseDto> {
    return this.stallionsService.profileUpdate(stallionId, updateDto);
  }

  @ApiOperation({
    summary: 'Stallion Gallery Image - Update Media Info',
  })
  @ApiOkResponse({
    description: '',
    type: StallionInfoResponseDto,
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    id: 'STALLIONS_UPDATE_GALLERY_IMAGES',
    method: 'UPDATE',
    stallionIn: 'params',
    stallionKey: 'stallionId',
  })
  @UseGuards(JwtAuthenticationGuard, StallionGuard)
  @Patch(':stallionId/gallery-images')
  galleryUpdate(
    @Param('stallionId', new ParseUUIDPipe()) stallionId: string,
    @Body() updateDto: UpdateStallionGalleryDto,
  ): Promise<StallionInfoResponseDto> {
    return this.stallionsService.galleryUpdate(stallionId, updateDto);
  }

  @ApiOperation({
    summary: 'Stallion Overview - Update',
  })
  @ApiOkResponse({
    description: '',
    type: StallionInfoResponseDto,
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    id: 'STALLIONS_UPDATE_OVERVIEW',
    method: 'UPDATE',
    stallionIn: 'params',
    stallionKey: 'stallionId',
  })
  @UseGuards(JwtAuthenticationGuard, StallionGuard)
  @Patch(':stallionId/overview')
  overviewUpdate(
    @Param('stallionId', new ParseUUIDPipe()) stallionId: string,
    @Body() updateDto: UpdateStallionOverviewDto,
  ): Promise<StallionInfoResponseDto> {
    return this.stallionsService.overviewUpdate(stallionId, updateDto);
  }

  @ApiOperation({
    summary: 'Stallion Testimonial - Add/Update',
  })
  @ApiOkResponse({
    description: '',
    type: StallionInfoResponseDto,
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    id: 'STALLIONS_UPDATE_TESTIMONIALS',
    method: 'UPDATE',
    stallionIn: 'params',
    stallionKey: 'stallionId',
  })
  @UseGuards(JwtAuthenticationGuard, StallionGuard)
  @Patch(':stallionId/testimonials')
  testimonialUpdate(
    @Param('stallionId', new ParseUUIDPipe()) stallionId: string,
    @Body() updateDto: UpdateStallionTestimonialDto,
  ): Promise<StallionInfoResponseDto> {
    return this.stallionsService.testimonialUpdate(stallionId, updateDto);
  }

  @ApiOperation({
    summary: 'Remove Stallion',
  })
  @ApiOkResponse({
    description: 'Stallion removed successfully',
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    id: 'STALLIONS_DELETE',
    method: 'DELETE',
    stallionIn: 'body',
    stallionKey: 'stallionId',
  })
  @UseGuards(JwtAuthenticationGuard, StallionGuard)
  @Delete()
  remove(@Body() deleteStallionDto: deleteStallionDto) {
    return this.stallionsService.remove(deleteStallionDto);
  }

  @ApiOperation({
    summary: 'Get All Stallion Gallery Images',
  })
  @ApiOkResponse({
    description: '',
    type: GalleryImagesResponse,
    isArray: true,
  })
  @Get(':stallionId/gallery-images')
  getAllStallionGalleryImages(
    @Param('stallionId', new ParseUUIDPipe()) stallionId: string,
  ): Promise<GalleryImagesResponse[]> {
    return this.stallionsService.getAllStallionGalleryImages(stallionId);
  }

  @ApiOperation({
    summary: 'Get all stallion testimonials',
  })
  @ApiOkResponse({
    description: '',
    type: StallionTestimonialResponse,
    isArray: true,
  })
  @Get(':stallionId/testimonials')
  allTestimonials(
    @Param('stallionId', new ParseUUIDPipe()) stallionId: string,
  ): Promise<StallionTestimonialResponse[]> {
    return this.stallionsService.getAllTestimonialsByStallionId(stallionId);
  }

  @ApiOperation({
    summary: 'Stallion Testimoial Media - Get Presigned Url',
  })
  @ApiOkResponse({
    description: '',
    type: PresignedUrlDto,
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    id: 'STALLIONS_GET_TESTIMONIAL_IMAGE_PRESIGNEDURL',
    method: 'READ',
    stallionIn: 'params',
    stallionKey: 'stallionId',
  })
  @UseGuards(JwtAuthenticationGuard, StallionGuard)
  @Post(':stallionId/testimonials-media')
  async testimonialsMediaUpload(
    @Param('stallionId', new ParseUUIDPipe()) stallionId: string,
    @Body() data: FileUploadUrlDto,
  ): Promise<PresignedUrlDto> {
    return await this.stallionsService.testimonialsMediaUpload(
      stallionId,
      data,
    );
  }

  @ApiOperation({
    summary: 'Get Stallion Pedigree - By Level',
  })
  @ApiOkResponse({
    description: '',
    type: StallionPedigreeResponseDto,
  })
  @Get(':stallionId/pedigree/:level')
  async getPedigreeByLevel(
    @Param('stallionId', new ParseUUIDPipe()) stallionId: string,
    @Param('level') level: number,
  ) {
    return await this.stallionsService.getStallionPedigreeByIdAndViewType(
      stallionId,
      'tree',
      level,
    );
  }

  @ApiOperation({
    summary: 'Get Hypomating Pedigree - By Level',
  })
  @ApiOkResponse({
    description: '',
    type: StallionPedigreeResponseDto,
  })
  @Get('hypo-mating/:stallionId/:mareId/:generation')
  async getHypoMatingDetails(
    @Param('stallionId', new ParseUUIDPipe()) stallionId: string,
    @Param('mareId', new ParseUUIDPipe()) mareId: string,
    @Param('generation') generation: number,
    @Query() searchOptions: HypoMatingAdditionalInfoDto,
  ) {
    return await this.stallionsService.getHypoMatingDetails(
      stallionId,
      mareId,
      generation,
      searchOptions,
    );
  }

  @ApiOperation({
    summary: 'Get Auth Hypomating Pedigree - By Level',
  })
  @ApiOkResponse({
    description: '',
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    id: 'STALLIONS_GET_SM_HYPOMATING',
    method: 'GET',
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('auth/hypo-mating/:stallionId/:mareId/:generation')
  async getAuthHypoMatingDetails(
    @Param('stallionId', new ParseUUIDPipe()) stallionId: string,
    @Param('mareId', new ParseUUIDPipe()) mareId: string,
    @Param('generation') generation: number,
    @Query() searchOptions: HypoMatingAdditionalInfoDto,
  ) {
    return await this.stallionsService.getHypoMatingDetails(
      stallionId,
      mareId,
      generation,
      searchOptions,
    );
  }

  @ApiOperation({
    summary: 'Get Pedigree Overlap - By Level',
  })
  @ApiOkResponse({
    description: '',
    type: StallionPedigreeResponseDto,
  })
  @Get('pedigree-overlap/:stallionId/:mareId/:swId/:generation')
  async getPedigreeOverlapDetails(
    @Param('stallionId', new ParseUUIDPipe()) stallionId: string,
    @Param('mareId', new ParseUUIDPipe()) mareId: string,
    @Param('swId', new ParseUUIDPipe()) swId: string,
    @Param('generation') generation: number,
  ) {
    return await this.stallionSearchService.getPedigreeOverlapDetails(
      stallionId,
      mareId,
      swId,
      generation,
    );
  }

  @ApiOperation({
    summary: 'Create a Stallion',
  })
  @ApiCreatedResponse({
    description: 'Stallion added successfully',
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    id: 'STALLIONS_CREATE_NEW',
    method: 'CREATE',
    farmIdIn: 'body',
    farmKey: 'farmId',
  })
  @UseGuards(JwtAuthenticationGuard, FarmGuard)
  @Post()
  create(@Body() createStallion: CreateStallionDto) {
    return this.stallionsService.create(createStallion);
  }

  @ApiOperation({
    summary: 'Stallion Stud Fee Update',
  })
  @ApiOkResponse({
    description: 'Service Fee Updated Successfully',
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    id: 'STALLIONS_UPDATE_STUDFEE',
    method: 'UPDATE',
    stallionIn: 'params',
    stallionKey: 'stallionId',
  })
  @UseGuards(JwtAuthenticationGuard, StallionGuard)
  @Patch('service-fee-update/:stallionId')
  serviceFeeUpdate(
    @Param('stallionId', new ParseUUIDPipe()) stallionId: string,
    @Body() createFeeDto: CreateStallionServiceFeeDto,
  ) {
    return this.stallionsService.serviceFeeUpdate(stallionId, createFeeDto);
  }

  @ApiOperation({
    summary: 'Get Stallion Latest Stud Fee By Year',
  })
  @ApiOkResponse({
    description: '',
    type: ServiceFeeByYearResponseDto,
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    id: 'STALLIONS_GET_STUDFEE_BY_YEAR',
    method: 'READ',
    stallionIn: 'params',
    stallionKey: 'stallionId',
  })
  @UseGuards(JwtAuthenticationGuard, StallionGuard)
  @Get(':stallionId/service-fee-by-year/:feeYear')
  getLatestServiceFeeByYear(
    @Param('stallionId', new ParseUUIDPipe()) stallionId: string,
    @Param('feeYear') feeYear: number,
  ): Promise<ServiceFeeByYearResponseDto> {
    return this.stallionsService.getLatestServiceFeeByYear(stallionId, feeYear);
  }

  @ApiOperation({
    summary: 'Save stallion page view count',
  })
  @ApiOkResponse({
    description: 'Page view created successfully',
  })
  @Post('stallion-page-view/:stallionId')
  staliionPageView(
    @Param('stallionId', new ParseUUIDPipe()) stallionId: string,
    @Body() data: PageReferrerDto,
  ) {
    return this.stallionsService.stallionPageView(stallionId, data.referrer);
  }

  @ApiOperation({
    summary: 'Save stallion page view count - Auth',
  })
  @ApiOkResponse({
    description: '',
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    id: 'STALLION_PAGE_VIEW',
    method: 'READ',
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Post('stallion-page-view-auth/:stallionId')
  authStallionPageView(
    @Param('stallionId', new ParseUUIDPipe()) stallionId: string,
    @Body() data: PageReferrerDto,
  ) {
    return this.stallionsService.stallionPageView(stallionId, data.referrer);
  }

  @ApiOperation({
    summary: 'Save stallion page social share count',
  })
  @ApiOkResponse({
    description: '',
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    id: 'STALLION_PAGE_SOCIAL_SHARE',
    method: 'CREATE',
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Post('stallion-page-social-share/:stallionId')
  authStallionSocialShare(
    @Param('stallionId', new ParseUUIDPipe()) stallionId: string,
    @Body() data: CreateMemberSocialShareDto,
  ) {
    return this.stallionsService.stallionSocialShare(
      stallionId,
      data.socialShareType,
    );
  }

  @ApiOperation({
    summary: 'Submit remove reason for a Stallion',
  })
  @ApiOkResponse({
    description: 'Reason updated successfully',
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    id: 'STALLIONS_UPDATE_RETIRE_REASON',
    method: 'UPDATE',
    stallionIn: 'params',
    stallionKey: 'stallionId',
  })
  @UseGuards(JwtAuthenticationGuard, StallionGuard)
  @Post('submit-remove-reason/:stallionId/:reasonId')
  submitRemoveReason(
    @Param('stallionId', new ParseUUIDPipe()) stallionId: string,
    @Param('reasonId') reasonId: number,
  ) {
    return this.stallionsService.submitRemoveReason(stallionId, reasonId);
  }

  @ApiOperation({
    summary: 'Race Records By StallionId',
  })
  @ApiOkResponse({
    description: '',
  })
  @Get(':stallionId/race-records')
  getStallionRaceRecords(
    @Param('stallionId', new ParseUUIDPipe()) stallionId: string,
  ) {
    return this.stallionsService.getStallionRaceRecords(stallionId);
  }

  @ApiOperation({
    summary: 'Stakes Progeny By StallionId',
  })
  @ApiOkResponse({
    description: '',
  })
  @Get(':stallionId/stakes-progeny')
  getStallionStakesProgeny(
    @Param('stallionId', new ParseUUIDPipe()) stallionId: string,
    @Query() searchOptionsDto: StakesProgenyPageOptionsDto,
  ) {
    return this.stallionsService.getStallionStakesProgeny(
      stallionId,
      searchOptionsDto,
    );
  }

  @ApiOperation({
    summary: 'Get Currency By Location',
  })
  @ApiOkResponse({
    description: '',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Get('get-currency/by-location/:productCode')
  getCurrency( @Param('productCode') productCode: string
  ) {
    return this.stallionsService.getCurrency(productCode);
  }

  @ApiOperation({
    summary: 'Get All Currency By Location',
  })
  @ApiOkResponse({
    description: '',
  })
  @Get('get-all-currency/by-location')
  getCurrencyREportCurrencies( @Query() currencyDto: currencyDto
  ) {
    return this.stallionsService.getCurrencyAllProducts(currencyDto);
  }
}
