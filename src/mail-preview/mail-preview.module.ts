import { Module } from '@nestjs/common';
import { MailPreviewService } from './mail-preview.service';
import { MailPreviewController } from './mail-preview.controller';
import { FileUploadsModule } from 'src/file-uploads/file-uploads.module';
@Module({
  imports: [FileUploadsModule],
  controllers: [MailPreviewController],
  providers: [MailPreviewService],
})
export class MailPreviewModule {}
