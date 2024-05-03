import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketingMedia } from './entities/marketing-media.entity';
import { MarketingMediaController } from './marketing-media.controller';
import { MarketingMediaService } from './marketing-media.service';

@Module({
  imports: [TypeOrmModule.forFeature([MarketingMedia])],
  controllers: [MarketingMediaController],
  providers: [MarketingMediaService],
  exports: [MarketingMediaService],
})
export class MarketingMediaModule {}
