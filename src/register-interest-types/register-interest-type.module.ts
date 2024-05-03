import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegisterInterestType } from './entity/register-interest-type.entity';
import { RegisterInterestTypeService } from './service/register-interest-type.service';

@Module({
  imports: [TypeOrmModule.forFeature([RegisterInterestType])],
  providers: [RegisterInterestTypeService],
  exports: [RegisterInterestTypeService],
})
export class RegisterInterestTypeModule {}
