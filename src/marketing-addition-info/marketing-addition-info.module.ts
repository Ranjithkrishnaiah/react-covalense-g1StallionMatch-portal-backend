import { Module } from '@nestjs/common';
import { MarketingAdditonInfoService } from './marketing-addition-info.service';
import { MarketingAdditonInfoController } from './marketing-addition-info.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketingAdditonInfo } from './entities/marketing-addition-info.entity';
import { MarketingAdditionInfoMediaModule } from 'src/marketing-addition-info-media/marketing-addition-info-media.module';
import { MediaModule } from 'src/media/media.module';
import { CommonUtilsModule } from 'src/common-utils/common-utils.module';
import { FileUploadsModule } from 'src/file-uploads/file-uploads.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MarketingAdditonInfo]),
    MarketingAdditionInfoMediaModule,
    MediaModule,
    FileUploadsModule,
    CommonUtilsModule,
  ],
  controllers: [MarketingAdditonInfoController],
  providers: [MarketingAdditonInfoService],
  exports: [MarketingAdditonInfoService],
})
export class MarketingAdditonInfoModule {}
