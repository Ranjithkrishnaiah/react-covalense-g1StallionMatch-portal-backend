import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinalPosition } from './entities/runner-final-position.entity';
import { RunnerFinalPositionController } from './runner-final-position.controller';
import { RunnerFinalPositionService } from './runner-final-position.service';

@Module({
  imports: [TypeOrmModule.forFeature([FinalPosition])],
  controllers: [RunnerFinalPositionController],
  providers: [RunnerFinalPositionService],
})
export class RunnerFinalPositionModule {}
