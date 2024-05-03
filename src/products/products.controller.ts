import { Controller, Get, UseGuards, Query, SetMetadata } from '@nestjs/common';
import { ProductsService } from './products.service';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { PageOptionsDto } from 'src/utils/dtos/page-options.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { RoleGuard } from 'src/role/role.gaurd';
import { SearchProductByCategoryDto } from './dto/search-product-by-category.dto';

@ApiTags('Products')
@Controller({
  path: 'products',
  version: '1',
})
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @ApiOperation({
    summary: 'Get All Products',
  })
  @ApiOkResponse({
    description: '',
    type: ProductResponseDto,
    isArray: true,
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    id: 'PRODUCTS_GET',
    method: 'READ',
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get()
  findAll(
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<ProductResponseDto[]> {
    return this.productsService.findAll();
  }

  @ApiOperation({
    summary: 'Get All Orders By Category',
  })
  @SetMetadata('api', {
    id: 'PRODUCTS_GET_BY_CATEGORY',
    method: 'READ',
  })
  @Get('/report-list')
  findProductsByCategory(@Query() searchOption: SearchProductByCategoryDto) {
    return this.productsService.findProductsByCategory(searchOption);
  }

  @ApiOperation({
    summary: 'Get All Orders By Category Testing',
  })
  @SetMetadata('api', {
    id: 'PRODUCTS_GET_BY_CATEGORY',
    method: 'READ',
  })
  @Get('/report-list/test')
  findProductsByCategoryTest(@Query() searchOption: SearchProductByCategoryDto) {
    return this.productsService.findProductsByCategoryTest(searchOption);
  }

  
}
