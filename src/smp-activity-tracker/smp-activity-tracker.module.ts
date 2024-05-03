import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SmpActivityTrackerService } from './smp-activity-tracker.service';

@Module({
  imports: [ConfigModule],
  providers: [SmpActivityTrackerService],
  exports: [SmpActivityTrackerService],
})
export class SmpActivityTrackerModule {}
