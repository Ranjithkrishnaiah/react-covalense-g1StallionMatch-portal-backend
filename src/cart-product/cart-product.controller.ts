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
import { CartProductService } from './cart-product.service';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from 'src/member-roles/roles.decorator';
import { RoleEnum } from 'src/member-roles/roles.enum';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { RolesGuard } from 'src/member-roles/roles.guard';
import { PageOptionsDto } from 'src/utils/dtos/page-options.dto';
import { ApiPaginatedResponse } from 'src/utils/decorators/api-paginated-response.decorator';
import { PageDto } from 'src/utils/dtos/page.dto';
import { CartProduct } from './entities/cart-product.entity';
import { RoleGuard } from 'src/role/role.gaurd';

@ApiTags('Cart Products')
@Controller({
  path: 'cart-products',
  version: '1',
})
export class CartProductController {
  constructor(private readonly cartProductService: CartProductService) {}

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get All Cart Product',
  })
  @ApiPaginatedResponse(CartProduct)
  @SetMetadata('api', {
    id: 'CART_PRODUCTS_GET',
    method: 'READ',
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  // @Roles(RoleEnum.farmadmin, RoleEnum.farmmember)
  // @UseGuards(JwtAuthenticationGuard, RolesGuard)
  @Get()
  findAll(
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<CartProduct>> {
    return this.cartProductService.findAll(pageOptionsDto);
  }
}
