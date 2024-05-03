import { Controller } from '@nestjs/common';
import { HorseProfileImageService } from './horse-profile-image.service';

@Controller('horse-profile-image')
export class HorseProfileImageController {
  constructor(
    private readonly horseProfileImageService: HorseProfileImageService,
  ) {}
}
