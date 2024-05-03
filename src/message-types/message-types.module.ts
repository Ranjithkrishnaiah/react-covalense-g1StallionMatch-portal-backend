import { Module } from '@nestjs/common';
import { MessageTypesService } from './message-types.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageType } from './entities/message-type.entity';
import { MessageTypesController } from './message-types.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MessageType])],
  controllers: [MessageTypesController],
  providers: [MessageTypesService],
  exports: [MessageTypesService],
})
export class MessageTypesModule {}
