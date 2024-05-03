import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StallionTestimonialMediaModule } from 'src/stallion-testimonial-media/stallion-testimonial-media.module';
import { FarmAccessLevel } from './entities/farm-access-level.entity';
import { FarmAccessLevelsController } from './farm-access-levels.controller';
import { FarmAccessLevelsService } from './farm-access-levels.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([FarmAccessLevel]),
    StallionTestimonialMediaModule,
  ],
  controllers: [FarmAccessLevelsController],
  providers: [FarmAccessLevelsService],
  exports: [FarmAccessLevelsService],
})
export class FarmAccessLevelsModule {}
