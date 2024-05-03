import { Module, Global } from '@nestjs/common';
import { RoleService } from '../role/role.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from '../role/entities/role.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Role])],
  providers: [RoleService],
  exports: [RoleService],
})
export class StallionGaurdModule {}
