import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketingMediaModule } from 'src/marketing-media/marketing-media.module';
import { MarketingPageHomeData } from './entities/marketing-page-home.entity';
import { MarketingPageHomeController } from './marketing-page-home.controller';
import { MarketingPageHomeService } from './marketing-page-home.service';
import { MarketingAdditonInfoModule } from 'src/marketing-addition-info/marketing-addition-info.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MarketingPageHomeData]),
    MarketingMediaModule,
    MarketingAdditonInfoModule,
  ],
  controllers: [MarketingPageHomeController],
  providers: [MarketingPageHomeService],
  exports: [MarketingPageHomeService],
})
export class MarketingPageHomeModule {}
