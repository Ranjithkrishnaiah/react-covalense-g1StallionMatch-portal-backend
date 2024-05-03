import {
  EventSubscriber,
  EntitySubscriberInterface,
  Connection,
  InsertEvent,
  UpdateEvent,
  RemoveEvent,
} from 'typeorm';
import { MemberInvitation } from './entities/member-invitation.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SoftRemoveEvent } from 'typeorm/subscriber/event/SoftRemoveEvent';

@EventSubscriber()
export class memberInvitationSubscriber
  implements EntitySubscriberInterface<MemberInvitation>
{
  constructor(
    private readonly connection: Connection,
    private eventEmitter: EventEmitter2,
  ) {
    connection.subscribers.push(this);
  }

  memberInvitation: MemberInvitation;
  dataList = [];
  listenTo() {
    return MemberInvitation;
  }

  async beforeInsert(event: InsertEvent<MemberInvitation>) {
    this.eventEmitter.emitAsync('newAcessLevelId', await event.entity);
  }

  async afterInsert(event: InsertEvent<MemberInvitation>) {
    this.eventEmitter.emit('InviteMemberToFarm', event.entity);
  }

  async afterLoad(entity: MemberInvitation) {
    this.memberInvitation = entity;
  }

  async beforeRemove(event: RemoveEvent<MemberInvitation>) {}

  afterRemove(event: RemoveEvent<MemberInvitation>) {}

  beforeSoftRemove(event: SoftRemoveEvent<MemberInvitation>) {}

  beforeUpdate(event: UpdateEvent<MemberInvitation>) {
    let entity: MemberInvitation = event.entity as MemberInvitation;
    this.memberInvitation = entity;
    this.dataList.push(this.memberInvitation);
  }
  afterSoftRemove(event: SoftRemoveEvent<MemberInvitation>) {}

  public async afterUpdate(event: UpdateEvent<MemberInvitation>) {
    let objectKeys = Object.keys(this.dataList[0]);
    objectKeys.forEach((column) => {
      let key: string = column;
      let oldValue = this.dataList[0][column];
      let newValue = event.entity[column];

      if (oldValue != newValue && newValue) {
        this.eventEmitter.emit('updateInviteMemberToFarm', {
          key: key,
          oldValue: oldValue,
          newValue: newValue,
        });
      }
    });
  }
}
