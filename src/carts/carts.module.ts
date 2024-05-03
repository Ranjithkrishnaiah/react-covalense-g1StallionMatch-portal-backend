import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartProductModule } from 'src/cart-product/cart-product.module';
import { CartProductItemsModule } from 'src/cart-product-items/cart-product-items.module';
import { CartsService } from './carts.service';
import { Cart } from './entities/cart.entity';
import { StallionsModule } from 'src/stallions/stallions.module';
import { HorsesModule } from 'src/horses/horses.module';
import { CartsController } from './carts.controller';
import { FarmsModule } from 'src/farms/farms.module';
import { ProductsModule } from 'src/products/products.module';
import { PricingModule } from 'src/pricing/pricing.module';
import { MembersModule } from 'src/members/members.module';
import { NominationRequestModule } from 'src/nomination-request/nomination-request.module';
import { StallionPromotionModule } from 'src/stallion-promotions/stallion-promotion.module';
import { BoostProfileModule } from 'src/boost-profile/boost-profile.module';
import { CurrenciesModule } from 'src/currencies/currencies.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cart]),
    CartProductModule,
    CartProductItemsModule,
    StallionsModule,
    HorsesModule,
    FarmsModule,
    ProductsModule,
    PricingModule,
    MembersModule,
    NominationRequestModule,
    StallionPromotionModule,
    BoostProfileModule,
    CurrenciesModule
  ],
  controllers: [CartsController],
  providers: [CartsService],
  exports: [CartsService],
})
export class CartsModule {}
