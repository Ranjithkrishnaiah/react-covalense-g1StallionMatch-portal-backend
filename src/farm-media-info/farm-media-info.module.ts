import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FarmMediaFilesModule } from 'src/farm-media-files/farm-media-files.module';
import { FarmMediaInfo } from './entities/farm-media-info.entity';
import { FarmMediaInfoService } from './farm-media-info.service';

@Module({
  imports: [TypeOrmModule.forFeature([FarmMediaInfo]), FarmMediaFilesModule],
  providers: [FarmMediaInfoService],
  exports: [FarmMediaInfoService],
})
export class FarmMediaInfoModule {}
