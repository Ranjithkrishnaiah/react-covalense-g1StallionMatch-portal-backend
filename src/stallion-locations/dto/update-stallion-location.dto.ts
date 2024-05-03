import { PartialType } from '@nestjs/swagger';
import { CreateStallionLocationDto } from './create-stallion-location.dto';

export class UpdateStallionLocationDto extends PartialType(
  CreateStallionLocationDto,
) {
  modifiedBy?: number | null;
}
