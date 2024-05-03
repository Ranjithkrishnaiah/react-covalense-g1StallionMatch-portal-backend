import { Module } from '@nestjs/common';
import { MaresListService } from './mares-list.service';
import { MaresListController } from './mares-list.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MareList } from './entities/mare-list.entity';
import { MulterModule } from '@nestjs/platform-express';
import { CsvModule } from 'nest-csv-parser';
import { FarmsModule } from 'src/farms/farms.module';
import { FileUploadsModule } from 'src/file-uploads/file-uploads.module';
import { CommonUtilsModule } from 'src/common-utils/common-utils.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MareList]),
    CsvModule,
    MulterModule.register({
      dest: './uploads/csv',
    }),
    FarmsModule,
    FileUploadsModule,
    CommonUtilsModule,
  ],
  controllers: [MaresListController],
  providers: [MaresListService],
  exports: [MaresListService],
})
export class MaresListModule {}
