import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { OrderProductService } from './order-product.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { PageOptionsDto } from 'src/utils/dtos/page-options.dto';
import { ApiPaginatedResponse } from 'src/utils/decorators/api-paginated-response.decorator';
import { OrderProduct } from './entities/order-product.entity';
import { PageDto } from 'src/utils/dtos/page.dto';

@ApiTags('Order Products')
@Controller({
  path: 'order-products',
  version: '1',
})
export class OrderProductController {
  constructor(private readonly orderProductService: OrderProductService) { }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Search Order Product'
  })
  @ApiPaginatedResponse(OrderProduct)
  @UseGuards(JwtAuthenticationGuard)
  @Get()
  findAll(
    @Query() pageOptionsDto: PageOptionsDto
  ): Promise<PageDto<OrderProduct>> {
    return this.orderProductService.findAll(
      pageOptionsDto
    );
  }
}
