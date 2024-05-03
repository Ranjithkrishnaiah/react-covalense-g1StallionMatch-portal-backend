import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { StallionGalleryImageDto } from 'src/stallion-gallery-images/dto/stallion-gallery-image.dto';

export class UpdateStallionGalleryDto {
  @ApiProperty({ type: [StallionGalleryImageDto] })
  @IsOptional()
  @Type(() => StallionGalleryImageDto)
  galleryImages: StallionGalleryImageDto[];
}
