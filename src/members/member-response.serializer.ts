import { Member } from './entities/member.entity';

const memberResponseSerializer = (member: Member) => {
  delete member.password;
  delete member.hash;
  delete member.previousPassword;
};

export default memberResponseSerializer;
