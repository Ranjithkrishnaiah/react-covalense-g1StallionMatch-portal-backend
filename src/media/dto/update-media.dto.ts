import { PartialType } from '@nestjs/swagger';
import { CreateMediaDto } from './create-media.dto';

export class UpdateMediaDto extends PartialType(CreateMediaDto) {
  markForDeletion?: boolean;
  markForDeletionRequestBy?: number | null;
  markForDeletionRequestDate?: Date | null;
  approvedBy?: number | null;
  approvedOn?: Date | null;
}
