import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CommonUtilsModule } from 'src/common-utils/common-utils.module';
import { FileUploadsModule } from 'src/file-uploads/file-uploads.module';
import { MailService } from './mail.service';

@Module({
  imports: [ConfigModule, CommonUtilsModule, FileUploadsModule],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
