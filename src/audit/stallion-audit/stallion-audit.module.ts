import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FarmsModule } from 'src/farms/farms.module';
import { StallionAuditEntity } from './stallion-audit.entity';
import { StallionAuditService } from './stallion-audit.service';

@Module({
  imports: [TypeOrmModule.forFeature([StallionAuditEntity]), FarmsModule],
  providers: [StallionAuditService],
  exports: [StallionAuditService],
})
export class StallionAuditModule {}
