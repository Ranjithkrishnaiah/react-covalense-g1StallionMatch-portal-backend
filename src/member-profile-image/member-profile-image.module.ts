import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberProfileImage } from './entities/member-profile-image.entity';
import { MemberProfileImageController } from './member-profile-image.controller';
import { MemberProfileImageService } from './member-profile-image.service';

@Module({
  imports: [TypeOrmModule.forFeature([MemberProfileImage])],
  controllers: [MemberProfileImageController],
  providers: [MemberProfileImageService],
  exports: [MemberProfileImageService],
})
export class MemberProfileImageModule {}
