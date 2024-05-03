import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HorseTypesService } from './horse-types.service';

@ApiTags('HorseTypes')
@Controller({
  path: 'horse-types',
  version: '1',
})
export class HorseTypesController {
  constructor(private readonly horseTypesService: HorseTypesService) {}
}
