import { Controller } from '@nestjs/common';
import { RunnerService } from './runner.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Runners')
@Controller({
  path: 'runner',
  version: '1',
})
export class RunnerController {
  constructor() {}
}
