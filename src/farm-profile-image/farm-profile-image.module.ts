import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FarmProfileImage } from './entities/farm-profile-image.entity';
import { FarmProfileImageController } from './farm-profile-image.controller';
import { FarmProfileImageService } from './farm-profile-image.service';
@Module({
  imports: [TypeOrmModule.forFeature([FarmProfileImage])],
  controllers: [FarmProfileImageController],
  providers: [FarmProfileImageService],
  exports: [FarmProfileImageService],
})
export class FarmProfileImageModule {}
