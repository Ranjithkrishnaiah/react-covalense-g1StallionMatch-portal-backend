import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Race } from './entities/race.entity';
import { Request } from 'express';

@Injectable()
export class RaceService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(Race)
    private raceRepository: Repository<Race>,
  ) {}
}
