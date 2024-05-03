import { Controller } from '@nestjs/common';
import { FarmProfileImageService } from './farm-profile-image.service';

@Controller('farm-profile-image')
export class FarmProfileImageController {
  constructor(
    private readonly farmProfileImageService: FarmProfileImageService,
  ) {}
}
