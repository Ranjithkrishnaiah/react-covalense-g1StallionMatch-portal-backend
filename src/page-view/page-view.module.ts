import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PageView } from './entities/page-view.entity';
import { PageViewController } from './page-view.controller';
import { PageViewService } from './page-view.service';
@Module({
  imports: [TypeOrmModule.forFeature([PageView])],
  controllers: [PageViewController],
  providers: [PageViewService],
  exports: [PageViewService],
})
export class PageViewModule {}
