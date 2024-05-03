import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RaceService } from './race.service';

@ApiTags('Race')
@Controller({
  path: 'race',
  version: '1',
})
export class RaceController {
  constructor(private readonly raceService: RaceService) {}
}
