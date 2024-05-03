import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StallionProfileImage } from './entities/stallion-profile-image.entity';
import { StallionProfileImageController } from './stallion-profile-image.controller';
import { StallionProfileImageService } from './stallion-profile-image.service';

@Module({
  imports: [TypeOrmModule.forFeature([StallionProfileImage])],
  controllers: [StallionProfileImageController],
  providers: [StallionProfileImageService],
  exports: [StallionProfileImageService],
})
export class StallionProfileImageModule {}
