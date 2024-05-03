import { Module } from '@nestjs/common';
import { CartProductItemsService } from './cart-product-items.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartProductItem } from './entities/cart-product-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CartProductItem])],
  providers: [CartProductItemsService],
  exports: [CartProductItemsService],
})
export class CartProductItemsModule {}
