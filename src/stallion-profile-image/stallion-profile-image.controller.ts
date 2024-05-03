import { Controller } from '@nestjs/common';
import { StallionProfileImageService } from './stallion-profile-image.service';

@Controller('stallion-profile-image')
export class StallionProfileImageController {
  constructor(
    private readonly stallionProfileImageService: StallionProfileImageService,
  ) {}
}
