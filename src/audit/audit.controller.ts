import { Controller } from '@nestjs/common';
import { AuditService } from './audit.service';

@Controller({
  path: 'audit',
  version: '1',
})
export class AuditController {
  constructor(private readonly auditService: AuditService) {}
}
