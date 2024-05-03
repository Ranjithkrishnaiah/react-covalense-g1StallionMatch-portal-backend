import { PartialType } from '@nestjs/swagger';
import { CreateOrderReportDto } from './create-order-report.dto';

export class UpdateOrderReportDto extends PartialType(CreateOrderReportDto) {}
