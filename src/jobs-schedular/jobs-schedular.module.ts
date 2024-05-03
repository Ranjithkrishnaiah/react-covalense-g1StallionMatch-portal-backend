import { Module } from '@nestjs/common';
import { MailModule } from 'src/mail/mail.module';
import { JobsSchedularService } from './jobs-schedular.service';
import { CommonUtilsModule } from 'src/common-utils/common-utils.module';

@Module({
  imports: [
    MailModule,
    CommonUtilsModule,
  ],
  providers: [JobsSchedularService],
  exports: [JobsSchedularService],
})
export class JobsSchedularModule {}
