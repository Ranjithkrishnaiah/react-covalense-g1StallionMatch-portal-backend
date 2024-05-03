import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FarmGalleryImageService } from './farm-gallery-image.service';

@ApiTags('Farm Gallery Images')
@Controller({
  path: 'farm-gallery-images',
  version: '1',
})
export class FarmGalleryImageController {
  constructor(
    private readonly farmGalleryImageService: FarmGalleryImageService,
  ) {}
}
