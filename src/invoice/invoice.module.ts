import { Module } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { InvoiceController } from './invoice.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartsModule } from 'src/carts/carts.module';
import { CartProductModule } from 'src/cart-product/cart-product.module';
import { CartProductItemsModule } from 'src/cart-product-items/cart-product-items.module';
import { OrderProductModule } from 'src/order-product/order-product.module';
import { OrderProductItemsModule } from 'src/order-product-items/order-product-items.module';

@Module({
  imports: [
    // TypeOrmModule.forFeature([Order]),
    CartsModule,
    CartProductModule,
    CartProductItemsModule,
    OrderProductModule,
    OrderProductItemsModule,
  ],
  controllers: [InvoiceController],
  providers: [InvoiceService],
  exports: [InvoiceService],
})
export class InvoiceModule {}
