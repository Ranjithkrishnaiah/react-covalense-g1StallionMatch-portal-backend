import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FarmAuditEntity } from './farm-audit.entity';
import { FarmAuditService } from './farm-audit.service';

@Module({
  imports: [TypeOrmModule.forFeature([FarmAuditEntity])],
  providers: [FarmAuditService],
  exports: [FarmAuditService],
})
export class FarmAuditModule {}
