import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Media } from './entities/media.entity';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { CommonUtilsModule } from 'src/common-utils/common-utils.module';

@Module({
  imports: [TypeOrmModule.forFeature([Media]), CommonUtilsModule],
  controllers: [MediaController],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}
