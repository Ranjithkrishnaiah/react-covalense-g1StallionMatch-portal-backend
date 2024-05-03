import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Runner } from './entities/runner.entity';
import { StallionsService } from 'src/stallions/stallions.service';

@Injectable()
export class RunnerService {
  constructor(
    @InjectRepository(Runner)
    private runnerRepository: Repository<Runner>,
    private readonly stallionsService: StallionsService,
  ) {}
}
