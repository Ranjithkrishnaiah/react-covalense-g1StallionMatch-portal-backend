import {
  EventSubscriber,
  EntitySubscriberInterface,
  Connection,
  InsertEvent,
  UpdateEvent,
  RemoveEvent,
} from 'typeorm';
import { MareRequest } from './entities/mare-request.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RecoverEvent } from 'typeorm/subscriber/event/RecoverEvent';

@EventSubscriber()
export class MareSubscriber implements EntitySubscriberInterface<MareRequest> {
  constructor(
    private readonly connection: Connection,
    private eventEmitter: EventEmitter2,
  ) {
    connection.subscribers.push(this);
  }

  mareRequest: MareRequest;

  listenTo() {
    return MareRequest;
  }

  async afterInsert(event: InsertEvent<MareRequest>) {
    this.eventEmitter.emit('createMareRequest', event.entity);
  }

  async beforeInsert(entity: InsertEvent<MareRequest>) {}

  async beforeRemove(event: RemoveEvent<MareRequest>) {}

  async afterRemove(event: RemoveEvent<MareRequest>) {}

  async afterLoad(entity: MareRequest) {
    this.mareRequest = entity;
  }

  async afterUpdate(event: UpdateEvent<MareRequest>) {
    let objectKeys = Object.keys(this.mareRequest);

    objectKeys.forEach((column) => {
      let key: string = column;
      let oldValue = this.mareRequest[column];
      let newValue = event.entity[column];

      if (oldValue != newValue && newValue) {
      }
    });
  }

  public async beforeUpdate(event: UpdateEvent<MareRequest>) {}

  public async afterUpate(event: UpdateEvent<MareRequest>) {}

  afterRecover(event: RecoverEvent<any>) {}
}
