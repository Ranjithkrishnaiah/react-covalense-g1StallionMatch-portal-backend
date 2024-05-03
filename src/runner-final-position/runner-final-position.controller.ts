import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RunnerFinalPositionService } from './runner-final-position.service';

@ApiTags('Runner')
@Controller({
  path: 'runner-final-position',
  version: '1',
})
export class RunnerFinalPositionController {
  constructor(
    private readonly runnerFinalPositionService: RunnerFinalPositionService,
  ) {}
}
