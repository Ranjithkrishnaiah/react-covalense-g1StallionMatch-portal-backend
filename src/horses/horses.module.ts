import { Module } from '@nestjs/common';
import { HorsesService } from './horses.service';
import { HorsesController } from './horses.controller';
import { Horse } from './entities/horse.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonUtilsModule } from 'src/common-utils/common-utils.module';
import { CountryModule } from 'src/country/country.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Horse]),
    CommonUtilsModule,
    CountryModule,
  ],
  controllers: [HorsesController],
  providers: [HorsesService],
  exports: [HorsesService],
})
export class HorsesModule {}
