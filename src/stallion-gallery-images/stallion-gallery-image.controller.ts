import { Controller } from '@nestjs/common';
import { StallionGalleryImageService } from './stallion-gallery-image.service';

@Controller({
  path: 'stallion-gallery-images',
  version: '1',
})
export class StallionGalleryImageController {
  constructor(
    private readonly stallionGalleryImageServiceService: StallionGalleryImageService,
  ) {}
}
