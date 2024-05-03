import {
  EventSubscriber,
  EntitySubscriberInterface,
  Connection,
  InsertEvent,
  UpdateEvent,
  RemoveEvent,
  LoadEvent,
  AfterSoftRemove,
} from 'typeorm';
import { Stallion } from './entities/stallion.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SoftRemoveEvent } from 'typeorm/subscriber/event/SoftRemoveEvent';
import { SmpActivityTrackerService } from 'src/smp-activity-tracker/smp-activity-tracker.service';

@EventSubscriber()
export class StallionsSubscriber
  implements EntitySubscriberInterface<Stallion>
{
  constructor(
    private readonly connection: Connection,
    private eventEmitter: EventEmitter2,
    private smpTrackerService: SmpActivityTrackerService,
  ) {
    connection.subscribers.push(this);
  }

  stallion: Stallion;
  dataList: any = [];

  listenTo() {
    return Stallion;
  }

  async beforeInsert(event: InsertEvent<Stallion>) {}

  async afterInsert(event: InsertEvent<Stallion>) {
    this.eventEmitter.emit('createStallion', event.entity);
  }

  async afterLoad(entity: Stallion, event?: LoadEvent<Stallion>) {
    this.stallion = entity;
  }

  beforeRemove(event: RemoveEvent<Stallion>) {}

  afterRemove(event: RemoveEvent<Stallion>) {}

  beforeSoftRemove(event: SoftRemoveEvent<Stallion>) {}

  beforeUpdate(event: UpdateEvent<Stallion>): Promise<any> | void {}

  afterSoftRemove(event: SoftRemoveEvent<Stallion>) {}

  async afterUpdate(event: UpdateEvent<Stallion>) {
    let objectKeys = Object.keys(this.stallion);
    objectKeys.forEach((column) => {
      let key: string = column;
      let oldValue = this.stallion[column];
      let newValue = event.entity[column];
      if (oldValue != newValue && newValue) {
        this.eventEmitter.emitAsync('updateActivityFarm', {
          key: key,
          oldValue: oldValue,
          newValue: newValue,
        });
      }
    });
    if (event.entity) {
      this.eventEmitter.emit('deletedStallion', {
        deleteStallion: this.stallion,
        originalEntity: event.entity,
      });
    }
  }
}
