import { Module } from '@nestjs/common';
import { PromoCodeService } from './promo-codes.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromoCode } from './entities/promo-code.entity';
import { PromoCodesController } from './promo-codes.controller';
import { MembersModule } from 'src/members/members.module';

@Module({
  imports: [TypeOrmModule.forFeature([PromoCode]), MembersModule],
  controllers: [PromoCodesController],
  providers: [PromoCodeService],
  exports: [PromoCodeService],
})
export class PromoCodesModule {}
