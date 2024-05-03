import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
  Query,
  SetMetadata,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CartsService } from './carts.service';
import { CreateCartProductDto } from 'src/cart-product/dto/create-cart-product.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { DeleteCartDto } from './dto/delete-cart.dto';
import { PageOptionsDto } from 'src/utils/dtos/page-options.dto';
import { ApiPaginatedResponse } from 'src/utils/decorators/api-paginated-response.decorator';
import { Cart } from './entities/cart.entity';
import { RoleGuard } from 'src/role/role.gaurd';
import { BroodmareAfinityCartDto } from './dto/broodmareAfinityCart.dto';
import { StallionAfinityCartDto } from './dto/stallionAfinityCart.dto';
import { BroodmareSireCartDto } from './dto/broodmareSireCart.dto';
import { ShortlistStallionCartDto } from './dto/shortlistStallionCart.dto';
import { StallionMatchProCartDto } from './dto/stallionMatchPro.dto';
import { SalesCatelogueCartDto } from './dto/salesCatelogueCart.dto';
import { LocalBoostCartDto } from './dto/local-boost-request.dto';
import { ExtendedBoostCartDto } from './dto/extended-boost-request.dto';
import { PotentialAudienceDto } from './dto/potential-audience.dto';
import { CurrencyConversionCartDto } from './dto/currency-conversion.dto';
import { StallionBreedingStockSaleCartDto } from './dto/stallion-breeding-stock-sale.dto';

@ApiTags('Cart')
@Controller({
  path: 'cart',
  version: '1',
})
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create  Cart for Broodmare Sire Report',
  })
  @ApiCreatedResponse({
    description: 'The record has been successfully created.',
  })
  @UseGuards(JwtAuthenticationGuard)
  @Post('broodmare-sire')
  broodmareSireReport(@Body() broodmareSireCartDto: BroodmareSireCartDto) {
    return this.cartsService.broodmareSireReport(broodmareSireCartDto);
  }

  @ApiOperation({
    summary: 'Create  Cart for Broodmare Sire Report By Guest',
  })
  @ApiCreatedResponse({
    description: '',
  })
  @Post('broodmare-sire/guest')
  broodmareSireReportGuest(@Body() broodmareSireCartDto: BroodmareSireCartDto) {
    return this.cartsService.broodmareSireReportGuest(broodmareSireCartDto);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create  Cart for Broodmare Afinity Report',
  })
  @ApiCreatedResponse({
    description: 'The record has been successfully created.',
  })
  @UseGuards(JwtAuthenticationGuard)
  @Post('broodmare-afinity')
  broodmareAfinityReport(
    @Body() broodmareAfinityCartDto: BroodmareAfinityCartDto,
  ) {
    return this.cartsService.broodmareAfinityReport(broodmareAfinityCartDto);
  }

  @ApiOperation({
    summary: 'Create  Cart for Broodmare Afinity Report By Guest',
  })
  @ApiCreatedResponse({
    description: '',
  })
  @Post('broodmare-afinity/guest')
  broodmareAfinityReportGuest(
    @Body() broodmareAfinityCartDto: BroodmareAfinityCartDto,
  ) {
    return this.cartsService.broodmareAfinityReportGuest(
      broodmareAfinityCartDto,
    );
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create  Cart for Stallion Afinity Report',
  })
  @ApiCreatedResponse({
    description: 'The record has been successfully created.',
  })
  @UseGuards(JwtAuthenticationGuard)
  @Post('stallion-afinity')
  stallionAfinityReport(
    @Body() stallionAfinityCartDto: StallionAfinityCartDto,
  ) {
    return this.cartsService.stallionAfinityReport(stallionAfinityCartDto);
  }

  @ApiOperation({
    summary: 'Create  Cart for Stallion Afinity Report',
  })
  @ApiCreatedResponse({
    description: '',
  })
  @Post('stallion-afinity/guest')
  stallionAfinityReportGuest(
    @Body() stallionAfinityCartDto: StallionAfinityCartDto,
  ) {
    return this.cartsService.stallionAfinityReportGuest(stallionAfinityCartDto);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create  Cart for Shortlist Stallion Report',
  })
  @ApiCreatedResponse({
    description: 'The record has been successfully created.',
  })
  @UseGuards(JwtAuthenticationGuard)
  @Post('shortlist-stallion')
  shortlistStallionReport(
    @Body() shortlistStallionCartDto: ShortlistStallionCartDto,
  ) {
    return this.cartsService.shortlistStallionReport(shortlistStallionCartDto);
  }

  @ApiOperation({
    summary: 'Create  Cart for Shortlist Stallion Report By Guest',
  })
  @ApiCreatedResponse({
    description: '',
  })
  @Post('shortlist-stallion/guest')
  shortlistStallionReportGuest(
    @Body() shortlistStallionCartDto: ShortlistStallionCartDto,
  ) {
    return this.cartsService.shortlistStallionReportGuest(
      shortlistStallionCartDto,
    );
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create  Cart for Stallion Match Pro Report',
  })
  @ApiCreatedResponse({
    description: 'The record has been successfully created.',
  })
  @UseGuards(JwtAuthenticationGuard)
  @Post('stallion-match-pro')
  stallionMatchProReport(
    @Body() stallionMatchProCartDto: StallionMatchProCartDto,
  ) {
    return this.cartsService.stallionMatchProReport(stallionMatchProCartDto);
  }

  @ApiOperation({
    summary: 'Create  Cart for Stallion Match Pro Report',
  })
  @ApiCreatedResponse({
    description: '',
  })
  @Post('stallion-match-pro/guest')
  stallionMatchProReportGuest(
    @Body() stallionMatchProCartDto: StallionMatchProCartDto,
  ) {
    return this.cartsService.stallionMatchProReportGuest(
      stallionMatchProCartDto,
    );
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create  Cart for Stallion Match Pro Report',
  })
  @ApiCreatedResponse({
    description: 'The record has been successfully created.',
  })
  @UseGuards(JwtAuthenticationGuard)
  @Post('sales-catelogue')
  salesCatelogueReport(@Body() salesCatelogueCartDto: SalesCatelogueCartDto) {
    return this.cartsService.salesCatelogueReport(salesCatelogueCartDto);
  }

  @ApiOperation({
    summary: 'Create  Cart for Stallion Match Pro Report',
  })
  @ApiCreatedResponse({
    description: '',
  })
  @Post('sales-catelogue/guest')
  salesCatelogueReportGuest(
    @Body() salesCatelogueCartDto: SalesCatelogueCartDto,
  ) {
    return this.cartsService.salesCatelogueReportGuest(salesCatelogueCartDto);
  }


  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create  Cart for Stallion X Breeding Stock Sale Report',
  })
  @ApiCreatedResponse({
    description: 'The record has been successfully created.',
  })
  @UseGuards(JwtAuthenticationGuard)
  @Post('stallion-breeding-stock-sale')
  stallionBreedingStockSaleReport(@Body() stallionBreedingStockSaleCartDto: StallionBreedingStockSaleCartDto) {
    return this.cartsService.stallionBreedingStockSaleReport(stallionBreedingStockSaleCartDto);
  }

  @ApiOperation({
    summary: 'Create  Cart for Stallion Match Pro Report',
  })
  @ApiCreatedResponse({
    description: '',
  })
  @Post('stallion-breeding-stock-sale/guest')
  stallionBreedingStockSaleReportGuest(
    @Body() stallionBreedingStockSaleCartDto: StallionBreedingStockSaleCartDto,
  ) {
    return this.cartsService.stallionBreedingStockSaleReportGuest(stallionBreedingStockSaleCartDto);
  }


  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create  Cart for Local Boost',
  })
  @ApiCreatedResponse({
    description: '',
  })
  @UseGuards(JwtAuthenticationGuard)
  @Post('local-boost')
  addLocalBoost(@Body() localBoostCartDto: LocalBoostCartDto) {
    return this.cartsService.addLocalBoost(localBoostCartDto);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create  Cart for Local Boost',
  })
  @ApiCreatedResponse({
    description: '',
  })
  @UseGuards(JwtAuthenticationGuard)
  @Post('extended-boost')
  addExtedndedBoost(@Body() extendedBoostCartDto: ExtendedBoostCartDto) {
    return this.cartsService.addExtendedBoost(extendedBoostCartDto);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create  Cart for Local Boost',
  })
  @ApiCreatedResponse({
    description: '',
  })
  @UseGuards(JwtAuthenticationGuard)
  @Post('potential-audience')
  getPotentialAudience(@Body() extendedBoostCartDto: PotentialAudienceDto) {
    return this.cartsService.getPotentialAudience(extendedBoostCartDto);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create  Cart',
  })
  @ApiCreatedResponse({
    description: 'The record has been successfully created.',
  })
  @SetMetadata('api', {
    id: 'CART_CREATE',
    method: 'CREATE',
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Post()
  create(@Body() createCartProductDto: CreateCartProductDto) {
    return this.cartsService.create(createCartProductDto);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get All Carts ',
  })
  @ApiPaginatedResponse(Cart)
  @SetMetadata('api', {
    id: 'CART_GET',
    method: 'READ',
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get()
  findAll(@Query() pageOptionsDto: PageOptionsDto) {
    return this.cartsService.findAll(pageOptionsDto);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update Cart',
  })
  @ApiOkResponse({
    description: 'The record has been updated successfully.',
  })
  @SetMetadata('api', {
    id: 'CART_UPDATE',
    method: 'UPDATE',
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Patch()
  update(@Body() createCartProductDto: CreateCartProductDto) {
    return this.cartsService.update(createCartProductDto);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Remove Cart',
  })
  @ApiOkResponse({
    description: 'The record has been deleted successfully.',
  })
  @SetMetadata('api', {
    id: 'CART_DELETE',
    method: 'DELETE',
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Delete()
  remove(@Body() deleteCartDto: DeleteCartDto) {
    return this.cartsService.remove(deleteCartDto);
  }

  @ApiOperation({
    summary: 'Get Cart Information',
  })
  @ApiOkResponse({
    description: 'Get Cart Information',
  })
  @Get(':cartId')
  getItemInfo(@Param('cartId', new ParseUUIDPipe()) cartId: string) {
    return this.cartsService.getItemInfo(cartId);
  }

  @ApiOperation({
    summary: 'Convert Currency at Checkout',
  })
  @ApiOkResponse({
    description: 'Convert Currency at Checkout',
  })
  @Post('currency/convert-currency')
  convertCurency( @Body() currencyConversionCartDto:CurrencyConversionCartDto) {
    return this.cartsService.convertCurrency(currencyConversionCartDto);
  }
}
