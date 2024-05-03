import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SmpReport } from './entities/smp-report.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SmpReport])],
})
export class SmpReportModule {}
