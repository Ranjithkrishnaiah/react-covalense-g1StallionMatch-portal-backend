import {
  Inject,
  Injectable,
  Scope
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

@Injectable({ scope: Scope.REQUEST })
export class InvoiceService {
  constructor(@Inject(REQUEST) private readonly request: Request) {}

  async create() {}

  async findAll() {
    const member = this.request.user;
  }

  findOne(feilds) {}

  async delete(id: number) {}

  // async update(id: number, farmLocationDto: FarmLocationDto) {
  //   return this.farmLocationRepository.update({farmId: id}, farmLocationDto);
  // }

  async update() {}
}
