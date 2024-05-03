import { Module } from '@nestjs/common';
import { MaresListInfoService } from './mare-list-info.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MareListInfo } from './entities/mare-list-info.entity';
import { MulterModule } from '@nestjs/platform-express';
import { CsvModule } from 'nest-csv-parser';

@Module({
  imports: [
    TypeOrmModule.forFeature([MareListInfo]),
    CsvModule,
    MulterModule.register({
      dest: './uploads/csv',
    }),
  ],
  providers: [MaresListInfoService],
  exports: [MaresListInfoService],
})
export class MaresListInfoModule {}
