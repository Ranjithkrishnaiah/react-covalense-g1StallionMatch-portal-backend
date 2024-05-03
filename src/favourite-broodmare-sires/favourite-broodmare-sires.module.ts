import { Module } from '@nestjs/common';
import { FavouriteBroodmareSireService } from './favourite-broodmare-sires.service';
import { FavouriteBroodmareSiresController } from './favourite-broodmare-sires.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FavouriteBroodmareSire } from './entities/favourite-broodmare-sire.entity';
import { HorsesModule } from 'src/horses/horses.module';

@Module({
  imports: [TypeOrmModule.forFeature([FavouriteBroodmareSire]), HorsesModule],
  controllers: [FavouriteBroodmareSiresController],
  providers: [FavouriteBroodmareSireService],
  exports: [FavouriteBroodmareSireService],
})
export class FavouriteBroodmareSiresModule {}
