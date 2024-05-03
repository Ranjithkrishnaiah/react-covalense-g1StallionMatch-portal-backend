import { Module } from '@nestjs/common';
import { MemberFarmsModule } from 'src/member-farms/member-farms.module';
import { CommonUtilsService } from './common-utils.service';

@Module({
  imports: [MemberFarmsModule],
  providers: [CommonUtilsService],
  exports: [CommonUtilsService],
})
export class CommonUtilsModule {}
