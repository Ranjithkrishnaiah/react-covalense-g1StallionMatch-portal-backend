import {
  EventSubscriber,
  EntitySubscriberInterface,
  Connection,
  InsertEvent,
  UpdateEvent,
  createConnection,
  RemoveEvent,
  LoadEvent,
  AfterSoftRemove,
} from 'typeorm';
import { Member } from './entities/member.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SoftRemoveEvent } from 'typeorm/subscriber/event/SoftRemoveEvent';
import { SmpActivityTrackerService } from 'src/smp-activity-tracker/smp-activity-tracker.service';

@EventSubscriber()
export class MemberSubscriber implements EntitySubscriberInterface<Member> {
  constructor(
    private readonly connection: Connection,
    private eventEmitter: EventEmitter2,
    private smpTrackerService: SmpActivityTrackerService,
  ) {
    connection.subscribers.push(this);
  }

  member: Member;
  dataList: any = [];

  listenTo() {
    return Member;
  }

  async beforeInsert(event: InsertEvent<Member>) {}

  async afterInsert(event: InsertEvent<Member>) {
    this.eventEmitter.emit('createMember', event.entity);
  }

  async afterLoad(entity: Member, event?: LoadEvent<Member>) {
    this.member = entity;
  }

  beforeRemove(event: RemoveEvent<Member>) {}

  afterRemove(event: RemoveEvent<Member>) {}

  beforeSoftRemove(event: SoftRemoveEvent<Member>) {}

  beforeUpdate(event: UpdateEvent<Member>): Promise<any> | void {}

  afterSoftRemove(event: SoftRemoveEvent<Member>) {}

  async afterUpdate(event: UpdateEvent<Member>) {
    if (this.member == undefined) return;

    let objectKeys = Object.keys(this.member);

    objectKeys.forEach((column) => {
      let key: string = column;
      let oldValue = this.member[column];
      let newValue = event.entity[column];

      if (oldValue != newValue && newValue) {
        if (key == 'fullName') {
          this.eventEmitter.emit('updatedMember', {
            key: key,
            oldValue: oldValue,
            newValue: newValue,
          });
        }
        if (key == 'email') {
          this.eventEmitter.emit('updatedMember', {
            key: key,
            oldValue: oldValue,
            newValue: newValue,
          });
        }
      }
    });
  }
}
