import { ApiResponseProperty } from '@nestjs/swagger';

export class UnreadCountResponseDto {
  @ApiResponseProperty()
  unreadCount: number;
}
