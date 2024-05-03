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
import { EventEmitter2 } from '@nestjs/event-emitter';
import { StallionPromotion } from './entities/stallion-promotion.entity';

@EventSubscriber()
export class StallionsPromotionSubscriber
  implements EntitySubscriberInterface<StallionPromotion>
{
  constructor(
    private readonly connection: Connection,
    private eventEmitter: EventEmitter2,
  ) {
    connection.subscribers.push(this);
  }

  stallionPromo: StallionPromotion;
  dataList = [];

  listenTo() {
    return StallionPromotion;
  }

  async afterInsert(event: InsertEvent<StallionPromotion>) {
    this.eventEmitter.emit('createStallionPomotion', event.entity);
  }

  async beforeInsert(entity: InsertEvent<StallionPromotion>) {}

  async beforeRemove(event: RemoveEvent<StallionPromotion>) {}

  async afterRemove(event: RemoveEvent<StallionPromotion>) {}

  async afterLoad(entity: StallionPromotion) {
    this.stallionPromo = entity;
  }

  async afterUpdate(event: UpdateEvent<StallionPromotion>) {
    if (this.stallionPromo == undefined) return;
    let objectKeys = Object.keys(this.stallionPromo);
    
    objectKeys.forEach((column) => {
      let key: string = column;
      let oldValue = this.stallionPromo[column];
      let newValue = event.entity[column];

      if (oldValue != newValue && newValue) {
        if (key == 'endDate') {
          // this.eventEmitter.emit('updateStallionStopPromotion', {
          //   key: key,
          //   oldValue: oldValue,
          //   newValue: newValue,
          // });
        }
      }
    });
  }
}
