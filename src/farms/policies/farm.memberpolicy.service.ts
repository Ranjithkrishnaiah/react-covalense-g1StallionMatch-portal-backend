import { InjectRepository } from '@nestjs/typeorm';
import { Farm } from '../entities/farm.entity';
import { Repository } from 'typeorm';
import { Request } from 'express';

import {
  ExecutionContext,
  Injectable,
  Scope,
  Inject,
  UnauthorizedException,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';

export class FarmMemberPolicyService {
  constructor(
    @InjectRepository(Farm)
    private farmsRepository: Repository<Farm>,
  ) {}
  async validate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    try {
    } catch (error) {
      throw error;
    }
  }
}
