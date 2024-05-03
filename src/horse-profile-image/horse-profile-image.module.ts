import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HorseProfileImage } from './entities/horse-profile-image.entity';
import { HorseProfileImageService } from './horse-profile-image.service';
import { HorseProfileImageController } from './horse-profile-image.controller';

@Module({
  imports: [TypeOrmModule.forFeature([HorseProfileImage])],
  controllers: [HorseProfileImageController],
  providers: [HorseProfileImageService],
  exports: [HorseProfileImageService],
})
export class HorseProfileImageModule {}
