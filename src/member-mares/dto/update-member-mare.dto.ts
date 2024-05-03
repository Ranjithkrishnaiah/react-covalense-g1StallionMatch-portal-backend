import { PartialType } from '@nestjs/swagger';
import { CreateMemberMareDto } from './create-member-mare.dto';

export class UpdateMemberMareDto extends PartialType(CreateMemberMareDto) {}
