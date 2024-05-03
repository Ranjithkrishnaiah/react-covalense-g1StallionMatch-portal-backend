import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FeatureService } from './feature.service';

@ApiTags('Feature')
@Controller({
  path: 'feature',
  version: '1',
})
export class FeatureController {
  constructor(private readonly featureService: FeatureService) {}
}
