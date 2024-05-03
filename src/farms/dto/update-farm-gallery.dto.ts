import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { FarmGalleryImageDto } from 'src/farm-gallery-images/dto/farm-gallery-image.dto';

export class UpdateFarmGalleryDto {
  @ApiProperty({ type: [FarmGalleryImageDto] })
  @IsOptional()
  @Type(() => FarmGalleryImageDto)
  galleryImages: FarmGalleryImageDto[];
}
