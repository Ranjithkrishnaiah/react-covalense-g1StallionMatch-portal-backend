import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common';
import { OrderProductItemsService } from './order-product-items.service';
import { OrderProductItemDto } from './dto/create-order-product-item.dto';
import { ApiBearerAuth, ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { OrderProductItem } from './entities/order-product-item.entity';
import { PageOptionsDto } from 'src/utils/dtos/page-options.dto';
import { ApiPaginatedResponse } from 'src/utils/decorators/api-paginated-response.decorator';
import { PageDto } from 'src/utils/dtos/page.dto';

@ApiTags('Order Product Items')
@Controller({
  path: 'order-product-items',
  version: '1',
})
export class OrderProductItemsController {
  constructor(private readonly orderProductItemsService: OrderProductItemsService) { }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create Order Product Item'
  })
  @ApiCreatedResponse({
    description: 'The record has been successfully created.',
  })
  @UseGuards(JwtAuthenticationGuard)
  @Post()
  create(@Body() createOrderProductDto: OrderProductItemDto) {
    return this.orderProductItemsService.create(createOrderProductDto);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Search Order Product Item'
  })
  @ApiPaginatedResponse(OrderProductItem)
  @UseGuards(JwtAuthenticationGuard)
  @Get()
  findAll(
    @Query() pageOptionsDto: PageOptionsDto
  ): Promise<PageDto<OrderProductItem>> {
    return this.orderProductItemsService.findAll(
      pageOptionsDto
    );
  }
}
