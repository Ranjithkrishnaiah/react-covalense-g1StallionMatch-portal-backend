import { IsEmail, IsObject } from 'class-validator';

export class CommonMailDto {
  @IsEmail()
  to?: string;

  @IsObject()
  context?: object;

  subject?: string;
  text?: string;
  template?: string;
}
