import { Module } from '@nestjs/common';
import { MemberPaymentAccessService } from './member-paytype-access.service';
import { MemberPaytypeAccessController } from './member-paytype-access.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberPaytypeAccess } from './entities/member-paytype-access.entity';
import { MembersModule } from 'src/members/members.module';

@Module({
  imports: [TypeOrmModule.forFeature([MemberPaytypeAccess]), MembersModule],
  controllers: [MemberPaytypeAccessController],
  providers: [MemberPaymentAccessService],
  exports: [MemberPaymentAccessService],
})
export class MemberPaytypeAccessModule {}
