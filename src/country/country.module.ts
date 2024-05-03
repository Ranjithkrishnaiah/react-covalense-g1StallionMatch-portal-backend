import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CountryRepository } from './repository/country.repository';
import { CountryService } from './service/country.service';
import { CountryController } from './country.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CountryRepository])],
  controllers: [CountryController],
  providers: [CountryService],
  exports: [CountryService],
})
export class CountryModule {}
