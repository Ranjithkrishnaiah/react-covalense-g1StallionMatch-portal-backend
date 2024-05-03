import { PartialType } from '@nestjs/swagger';
import { CreateReportProductItemDto } from './create-report-product-item.dto';

export class UpdateReportProductItemDto extends PartialType(CreateReportProductItemDto) {}
