import { Module } from '@nestjs/common';
import { OrderProductService } from './order-product.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderProduct } from './entities/order-product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OrderProduct])],
  providers: [OrderProductService],
  exports: [OrderProductService],
})
export class OrderProductModule {}
