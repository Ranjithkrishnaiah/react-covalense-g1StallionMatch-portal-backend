import { Module } from '@nestjs/common';
import { HorseTypesService } from './horse-types.service';
import { HorseTypesController } from './horse-types.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HorseType } from './entities/horse-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HorseType])],
  controllers: [HorseTypesController],
  providers: [HorseTypesService],
})
export class HorseTypesModule {}
