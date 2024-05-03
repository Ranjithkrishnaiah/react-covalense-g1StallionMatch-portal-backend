import { ApiResponseProperty } from '@nestjs/swagger';

export class RecipientResponseDto {
  @ApiResponseProperty()
  msgRecipientId: number;

  @ApiResponseProperty()
  isRead: boolean;

  @ApiResponseProperty()
  recipientId: number;
}
