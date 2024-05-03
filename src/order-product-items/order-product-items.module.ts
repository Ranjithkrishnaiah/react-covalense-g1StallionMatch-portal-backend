import { Module } from '@nestjs/common';
import { OrderProductItemsService } from './order-product-items.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderProductItem } from './entities/order-product-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OrderProductItem])],
  providers: [OrderProductItemsService],
  exports: [OrderProductItemsService],
})
export class OrderProductItemsModule { }
