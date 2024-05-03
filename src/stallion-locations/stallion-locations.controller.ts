import { Controller } from '@nestjs/common';
import { StallionLocationsService } from './stallion-locations.service';

@Controller('stallion-locations')
export class StallionLocationsController {
  constructor(
    private readonly stallionLocationsService: StallionLocationsService,
  ) {}
}
