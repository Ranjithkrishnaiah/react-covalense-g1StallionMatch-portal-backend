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
} from '@nestjs/common';
import { CartProductItemsService } from './cart-product-items.service';
import { CartProductItemDto } from './dto/create-cart-product-item.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { request } from 'http';
import { Roles } from 'src/member-roles/roles.decorator';
import { RoleEnum } from 'src/member-roles/roles.enum';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { RolesGuard } from 'src/member-roles/roles.guard';
import { CartProductItem } from './entities/cart-product-item.entity';
import { PageOptionsDto } from 'src/utils/dtos/page-options.dto';
import { ApiPaginatedResponse } from 'src/utils/decorators/api-paginated-response.decorator';
import { PageDto } from 'src/utils/dtos/page.dto';
import { RoleGuard } from 'src/role/role.gaurd';

@ApiTags('Cart Product Items')
@Controller({
  path: 'cart-product-items',
  version: '1',
})
export class CartProductItemsController {
  constructor(
    private readonly cartProductItemsService: CartProductItemsService,
  ) {}

  @ApiOperation({ summary: 'Create Cart Product Item' })
  @ApiCreatedResponse({
    description: 'Cart Product Item created successfully.',
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    id: 'CART_PRODUCTS_ITEMS_CREATE',
    method: 'CREATE',
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  // @Roles(RoleEnum.farmadmin, RoleEnum.farmmember)
  // @UseGuards(JwtAuthenticationGuard, RolesGuard)
  @Post()
  create(@Body() createCartProductDto: CartProductItemDto) {
    return this.cartProductItemsService.create(createCartProductDto);
  }

  @ApiOperation({ summary: 'Create Cart Product Item' })
  @ApiPaginatedResponse(CartProductItem)
  @ApiBearerAuth()
  @SetMetadata('api', {
    id: 'CART_PRODUCTS_ITEMS_GET',
    method: 'READ',
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  // @Roles(RoleEnum.farmadmin, RoleEnum.farmmember)
  // @UseGuards(JwtAuthenticationGuard, RolesGuard)
  @Get()
  findAll(
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<CartProductItem>> {
    return this.cartProductItemsService.findAll(pageOptionsDto);
  }
}
