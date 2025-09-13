import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class SoftDeleteProductRequest {
  @ApiProperty({
    description: 'Product ID',
    type: 'string',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  id: string;
}
