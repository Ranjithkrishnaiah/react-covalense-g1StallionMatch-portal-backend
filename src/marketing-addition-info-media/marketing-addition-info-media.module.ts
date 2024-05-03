import { Module } from '@nestjs/common';
import { MarketingAdditionInfoMediaService } from './marketing-addition-info-media.service';
import { MarketingAdditionInfoMediaController } from './marketing-addition-info-media.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketingAdditionInfoMedia } from './entities/marketing-addition-info-media.entity';
import { MediaModule } from 'src/media/media.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MarketingAdditionInfoMedia]),
    MediaModule,
  ],
  controllers: [MarketingAdditionInfoMediaController],
  providers: [MarketingAdditionInfoMediaService],
  exports: [MarketingAdditionInfoMediaService],
})
export class MarketingAdditionInfoMediaModule {}
