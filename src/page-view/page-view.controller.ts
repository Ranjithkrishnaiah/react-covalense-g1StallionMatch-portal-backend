import { Controller } from '@nestjs/common';
import { PageViewService } from './page-view.service';

@Controller({
  path: 'page-view',
  version: '1',
})
export class PageViewController {
  constructor(private readonly pageViewService: PageViewService) {}
}
