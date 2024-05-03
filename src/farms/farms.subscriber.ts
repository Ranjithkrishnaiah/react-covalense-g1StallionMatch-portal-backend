import {
  EventSubscriber,
  EntitySubscriberInterface,
  Connection,
  InsertEvent,
  UpdateEvent,
  createConnection,
  RemoveEvent,
  LoadEvent,
} from 'typeorm';
import { Farm } from './entities/farm.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RecoverEvent } from 'typeorm/subscriber/event/RecoverEvent';
import { SoftRemoveEvent } from 'typeorm/subscriber/event/SoftRemoveEvent';

@EventSubscriber()
export class FarmSubscriber implements EntitySubscriberInterface<Farm> {
  constructor(
    private readonly connection: Connection,
    private eventEmitter: EventEmitter2,
  ) {
    connection.subscribers.push(this);
  }

  farm: Farm;

  listenTo() {
    return Farm;
  }

  async afterInsert(event: InsertEvent<Farm>) {
    this.eventEmitter.emit('createFarm', event.entity);
  }

  async beforeInsert(entity: InsertEvent<Farm>) {}

  async beforeRemove(event: RemoveEvent<Farm>) {}

  async afterRemove(event: RemoveEvent<Farm>) {}

  async afterLoad(entity: Farm) {
    this.farm = entity;
  }

  beforeSoftRemove(event: SoftRemoveEvent<Farm>) {}

  afterSoftRemove(event: SoftRemoveEvent<Farm>) {}

  async afterUpdate(event: UpdateEvent<Farm>) {
    let objectKeys = Object.keys(this.farm);

    objectKeys.forEach((column) => {
      let key: string = column;
      let oldValue = this.farm[column];
      let newValue = event.entity[column];

      if (oldValue != newValue && newValue) {
        this.eventEmitter.emit('updateAuditFarm', {
          key: key,
          oldValue: oldValue,
          newValue: newValue,
          farmUuid: this.farm.farmUuid,
        });
        this.eventEmitter.emitAsync('farmUpdateActivity', {
          key: key,
          oldValue: oldValue,
          newValue: newValue,
        });
      }
    });
  }

  afterRecover(event: RecoverEvent<any>) {}
}
