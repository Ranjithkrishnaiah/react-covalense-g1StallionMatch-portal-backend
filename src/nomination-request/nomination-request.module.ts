import { Module } from '@nestjs/common';
import { NominationRequestService } from './nomination-request.service';
import { NominationRequestController } from './nomination-request.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NominationRequest } from './entities/nomination-request.entity';
import { StallionsModule } from 'src/stallions/stallions.module';
import { FarmsModule } from 'src/farms/farms.module';
import { HorsesModule } from 'src/horses/horses.module';
import { MessagesModule } from 'src/messages/messages.module';
import { MembersModule } from 'src/members/members.module';
import { MessageMediaModule } from 'src/message-media/message-media.module';
import { MediaModule } from 'src/media/media.module';
import { CurrenciesModule } from 'src/currencies/currencies.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([NominationRequest]),
    StallionsModule,
    FarmsModule,
    HorsesModule,
    MessagesModule,
    MembersModule,
    MessageMediaModule,
    MediaModule,
    CurrenciesModule
  ],
  controllers: [NominationRequestController],
  providers: [NominationRequestService],
  exports: [NominationRequestService],
})
export class NominationRequestModule {}
