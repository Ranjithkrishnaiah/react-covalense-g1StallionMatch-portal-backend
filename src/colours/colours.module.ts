import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ColoursService } from './colours.service';
import { ColoursController } from './colours.controller';
import { Colour } from './entities/colour.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Colour])],
  controllers: [ColoursController],
  providers: [ColoursService],
})
export class ColoursModule {}
