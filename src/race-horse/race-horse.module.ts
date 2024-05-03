import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CountryModule } from 'src/country/country.module';
import { HorsesModule } from 'src/horses/horses.module';
import { RaceHorse } from './entities/race-horse.entity';
import { RaceHorseController } from './race-horse.controller';
import { RaceHorseService } from './race-horse.service';

@Module({
  imports: [TypeOrmModule.forFeature([RaceHorse]), HorsesModule, CountryModule],
  controllers: [RaceHorseController],
  providers: [RaceHorseService],
  exports: [RaceHorseService],
})
export class RaceHorseModule {}
