import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberInvitationStallionsModule } from 'src/member-invitation-stallions/member-invitation-stallions.module';
import { MemberFarmStallion } from './entities/member-farm-stallion.entity';
import { MemberFarmStallionsService } from './member-farm-stallions.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([MemberFarmStallion]),
    MemberInvitationStallionsModule,
  ],
  providers: [MemberFarmStallionsService],
  exports: [MemberFarmStallionsService],
})
export class MemberFarmStallionsModule {}
