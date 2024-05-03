import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonUtilsModule } from 'src/common-utils/common-utils.module';
import { FileUploadsModule } from 'src/file-uploads/file-uploads.module';
import { MediaModule } from 'src/media/media.module';
import { MessagesModule } from 'src/messages/messages.module';
import { MessageMedia } from './entities/message-media.entity';
import { MessageMediaController } from './message-media.controller';
import { MessageMediaService } from './message-media.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([MessageMedia]),
    MediaModule,
    FileUploadsModule,
    MessagesModule,
    CommonUtilsModule,
  ],
  controllers: [MessageMediaController],
  providers: [MessageMediaService],
  exports: [MessageMediaService],
})
export class MessageMediaModule {}
