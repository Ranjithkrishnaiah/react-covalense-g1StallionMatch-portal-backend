import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentStatusResponseDto } from './dto/payment-status-response.dto';
import { PaymentStatus } from './entities/payment-status.entity';

@Injectable()
export class PaymentStatusService {
  constructor(
    @InjectRepository(PaymentStatus)
    private paymentStatusRepository: Repository<PaymentStatus>,
  ) {}

  /* Get all payment statuses */
  findAll(): Promise<PaymentStatusResponseDto[]> {
    return this.paymentStatusRepository.find();
  }

  /* Get a payment status */
  findOne(fields) {
    return this.paymentStatusRepository.find({ where: fields });
  }
}
