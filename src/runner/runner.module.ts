import { Module } from '@nestjs/common';
import { RunnerService } from './runner.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Runner } from './entities/runner.entity';
import { RunnerController } from './runner.controller';
import { StallionsModule } from 'src/stallions/stallions.module';

@Module({
  imports: [TypeOrmModule.forFeature([Runner]), StallionsModule],
  controllers: [RunnerController],
  providers: [RunnerService],
  exports: [RunnerService],
})
export class RunnerModule {}
