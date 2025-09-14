import { ApiProperty } from '@nestjs/swagger';

export class RateLimitResponse {
  @ApiProperty()
  message: string;

  @ApiProperty({
    enum: [429],
  })
  statusCode: 429;
}
