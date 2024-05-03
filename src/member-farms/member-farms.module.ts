import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberFarm } from './entities/member-farm.entity';
import { MemberFarmsService } from './member-farms.service';

@Module({
  imports: [TypeOrmModule.forFeature([MemberFarm])],
  providers: [MemberFarmsService],
  exports: [MemberFarmsService],
})
export class MemberFarmsModule {}
