import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberInvitationStallion } from './entities/member-invitation-stallion.entity';
import { MemberInvitationStallionsService } from './member-invitation-stallions.service';

@Module({
  imports: [TypeOrmModule.forFeature([MemberInvitationStallion])],
  providers: [MemberInvitationStallionsService],
  exports: [MemberInvitationStallionsService],
})
export class MemberInvitationStallionsModule {}
