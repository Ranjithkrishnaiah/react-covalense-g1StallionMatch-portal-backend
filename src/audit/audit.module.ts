import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FarmsModule } from 'src/farms/farms.module';
import { HorsesModule } from 'src/horses/horses.module';
import { MembersModule } from 'src/members/members.module';
import { MessagesModule } from 'src/messages/messages.module';
import { StallionsModule } from 'src/stallions/stallions.module';
import { AuditEntity } from './audit.entity';
import { AuditService } from './audit.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuditEntity]),
    forwardRef(() => StallionsModule),
    FarmsModule,
    HorsesModule,
    MessagesModule,
    MembersModule,
  ],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
