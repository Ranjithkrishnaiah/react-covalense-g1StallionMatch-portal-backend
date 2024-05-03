import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegisterInterestRepository } from './repository/register-interest.repository';
import { RegisterInterestService } from './service/register-interest.service';
import { RegisterInterestController } from './register-interest.controller';
import { RegisterInterestTypeModule } from 'src/register-interest-types/register-interest-type.module';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [
    RegisterInterestTypeModule,
    MailModule,
    TypeOrmModule.forFeature([RegisterInterestRepository]),
  ],
  controllers: [RegisterInterestController],
  providers: [RegisterInterestService],
})
export class RegisterInterestModule {}
