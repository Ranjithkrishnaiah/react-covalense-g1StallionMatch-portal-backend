import { Module } from '@nestjs/common';
import { FileUploadsService } from './file-uploads.service';

@Module({
  providers: [FileUploadsService],
  exports: [FileUploadsService],
})
export class FileUploadsModule {}
