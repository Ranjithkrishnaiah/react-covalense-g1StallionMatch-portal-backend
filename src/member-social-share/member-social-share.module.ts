import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberSocialShare } from './entities/member-social-share.entity';
import { MemberSocialShareController } from './member-social-share.controller';
import { MemberSocialShareService } from './member-social-share.service';
import { SocialShareTypeModule } from 'src/social-share-types/social-share-type.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([MemberSocialShare]),
    SocialShareTypeModule,
  ],
  controllers: [MemberSocialShareController],
  providers: [MemberSocialShareService],
  exports: [MemberSocialShareService],
})
export class MemberSocialShareModule {}
