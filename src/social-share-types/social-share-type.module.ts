import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocialShareType } from './entities/social-share-type.entity';
import { SocialShareTypeController } from './social-share-type.controller';
import { SocialShareTypeService } from './social-share-type.service';

@Module({
  imports: [TypeOrmModule.forFeature([SocialShareType])],
  controllers: [SocialShareTypeController],
  providers: [SocialShareTypeService],
  exports: [SocialShareTypeService],
})
export class SocialShareTypeModule {}
