import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageTypeResponseDto } from './dto/message-type-response.dto';
import { MessageType } from './entities/message-type.entity';

@Injectable()
export class MessageTypesService {
  constructor(
    @InjectRepository(MessageType)
    private messageTypeRepository: Repository<MessageType>,
  ) {}

  findAll(): Promise<MessageTypeResponseDto[]> {
    return this.messageTypeRepository.find();
  }

  findOne(id: number) {
    return this.messageTypeRepository.find({
      id,
    });
  }
}
