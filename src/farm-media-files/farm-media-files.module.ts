import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FarmMediaFile } from './entities/farm-media-file.entity';
import { FarmMediaFilesService } from './farm-media-files.service';

@Module({
  imports: [TypeOrmModule.forFeature([FarmMediaFile])],
  providers: [FarmMediaFilesService],
  exports: [FarmMediaFilesService],
})
export class FarmMediaFilesModule {}
