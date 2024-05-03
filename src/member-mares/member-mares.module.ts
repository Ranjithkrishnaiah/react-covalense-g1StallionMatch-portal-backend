import { Module } from '@nestjs/common';
import { MemberMaresService } from './member-mares.service';
import { MemberMaresController } from './member-mares.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberMare } from './entities/member-mare.entity';
import { HorsesModule } from 'src/horses/horses.module';
import { MemberMareSubscriber } from './member-mares.subscriber';

@Module({
  imports: [TypeOrmModule.forFeature([MemberMare]), HorsesModule],
  controllers: [MemberMaresController],
  providers: [MemberMaresService, MemberMareSubscriber],
  exports: [MemberMaresService],
})
export class MemberMaresModule {}
