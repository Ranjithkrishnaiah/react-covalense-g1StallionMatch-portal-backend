import { Module } from '@nestjs/common';
import { PaymentStatusService } from './payment-status.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentStatus } from './entities/payment-status.entity';
import { PaymentStatusController } from './payment-status.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentStatus])],
  controllers: [PaymentStatusController],
  providers: [PaymentStatusService],
  exports: [PaymentStatusService],
})
export class PaymentStatusModule {}
