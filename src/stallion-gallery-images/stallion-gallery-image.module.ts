import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StallionGalleryImage } from './entities/stallion-gallery-image.entity';
import { StallionGalleryImageController } from './stallion-gallery-image.controller';
import { StallionGalleryImageService } from './stallion-gallery-image.service';

@Module({
  imports: [TypeOrmModule.forFeature([StallionGalleryImage])],
  controllers: [StallionGalleryImageController],
  providers: [StallionGalleryImageService],
  exports: [StallionGalleryImageService],
})
export class StallionGalleryImageModule {}
