import { forwardRef, Module } from '@nestjs/common';
import { RaceService } from './race.service';
import { RaceController } from './race.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Race } from './entities/race.entity';
import { RunnerModule } from 'src/runner/runner.module';

@Module({
  imports: [TypeOrmModule.forFeature([Race]), forwardRef(() => RunnerModule)],
  providers: [RaceService],
  controllers: [RaceController],
  exports: [RaceService],
})
export class RaceModule {}
