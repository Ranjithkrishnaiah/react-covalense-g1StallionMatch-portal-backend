import { Module } from '@nestjs/common';
import { MessageChannelService } from './message-channel.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageChannel } from './entities/message-channel.entity';
import { MembersModule } from 'src/members/members.module';

@Module({
  imports: [TypeOrmModule.forFeature([MessageChannel]), MembersModule],
  providers: [MessageChannelService],
  exports: [MessageChannelService],
})
export class MessageChannelModule {}
