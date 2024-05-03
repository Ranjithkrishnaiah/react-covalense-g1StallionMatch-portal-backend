import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FarmGalleryImage } from './entities/farm-gallery-image.entity';
import { FarmGalleryImageController } from './farm-gallery-image.controller';
import { FarmGalleryImageService } from './farm-gallery-image.service';

@Module({
  imports: [TypeOrmModule.forFeature([FarmGalleryImage])],
  controllers: [FarmGalleryImageController],
  providers: [FarmGalleryImageService],
  exports: [FarmGalleryImageService],
})
export class FarmGalleryImageModule {}
