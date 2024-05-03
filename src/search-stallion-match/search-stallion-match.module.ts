import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchStallionMatchService } from './search-stallion-match.service';
import { SearchStallionMatch } from './entities/search-stallion-match.entity';
import { SearchStallionMatchController } from './search-stallion-match.controller';
import { FileUploadsModule } from 'src/file-uploads/file-uploads.module';
import { HtmlToPdfService } from 'src/file-uploads/html-to-pdf.service';
import { FarmsModule } from 'src/farms/farms.module';
import { CommonUtilsModule } from 'src/common-utils/common-utils.module';
import { MailModule } from 'src/mail/mail.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([SearchStallionMatch]),
    FileUploadsModule,
    FarmsModule,
    CommonUtilsModule,
    MailModule,
  ],
  controllers: [SearchStallionMatchController],
  providers: [SearchStallionMatchService, HtmlToPdfService],
  exports: [SearchStallionMatchService],
})
export class SearchStallionMatchModule {}
