import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentMethodResponseDto } from './dto/payment-method-response.dto';
import { PaymentMethod } from './entities/payment-method.entity';

@Injectable()
export class PaymentMethodsService {
  constructor(
    @InjectRepository(PaymentMethod)
    private paymentMethodRepository: Repository<PaymentMethod>,
  ) {}

  /* Get all payment methods */
  findAll(): Promise<PaymentMethodResponseDto[]> {
    return this.paymentMethodRepository.find();
  }

  /* Get a payment method */
  findOne(fields) {
    return this.paymentMethodRepository.find({ where: fields });
  }

  /* Get a payment method */
  async findPaymentType(id) {
    const record = await this.paymentMethodRepository.findOne({
      id: id,
    });
    return record;
  }
}
