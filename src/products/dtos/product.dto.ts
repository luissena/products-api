import { ApiProperty } from '@nestjs/swagger';

export class ProductDTO {
  @ApiProperty({
    description: 'Unique product identifier',
    type: 'string',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Product SKU code',
    type: 'string',
    maxLength: 50,
    example: 'IPHONE-15-PRO-128GB',
  })
  sku: string;

  @ApiProperty({
    description: 'Product name',
    type: 'string',
    maxLength: 255,
    example: 'iPhone 15 Pro 128GB',
  })
  name: string;

  @ApiProperty({
    description: 'Product brand',
    type: 'string',
    maxLength: 100,
    example: 'Apple',
  })
  brand: string;

  @ApiProperty({
    description: 'Product model',
    type: 'string',
    maxLength: 100,
    example: 'iPhone 15 Pro',
  })
  model: string;

  @ApiProperty({
    description: 'Product category',
    type: 'string',
    maxLength: 100,
    nullable: true,
    required: false,
    example: 'Electronics',
  })
  category?: string;

  @ApiProperty({
    description: 'Product color',
    type: 'string',
    maxLength: 50,
    nullable: true,
    required: false,
    example: 'Natural Titanium',
  })
  color?: string;

  @ApiProperty({
    description: 'Product price',
    type: 'number',
    format: 'decimal',
    nullable: true,
    required: false,
    example: 999.99,
  })
  price?: number;

  @ApiProperty({
    description: 'Price currency code',
    type: 'string',
    maxLength: 3,
    nullable: true,
    required: false,
    example: 'USD',
  })
  currency?: string;

  @ApiProperty({
    description: 'Available stock quantity',
    type: 'integer',
    nullable: true,
    required: false,
    example: 50,
  })
  stock?: number;

  @ApiProperty({
    description: 'External system ID',
    type: 'string',
    maxLength: 36,
    nullable: true,
    required: false,
    example: 'ext-12345',
  })
  externalId?: string;

  @ApiProperty({
    description: 'Integration source',
    type: 'string',
    maxLength: 100,
    nullable: true,
    required: false,
    example: 'contentful',
  })
  integration?: string;

  @ApiProperty({
    description: 'Creation timestamp',
    type: 'string',
    format: 'date-time',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    type: 'string',
    format: 'date-time',
    example: '2024-01-15T10:30:00.000Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Soft delete timestamp',
    type: 'string',
    format: 'date-time',
    nullable: true,
    required: false,
    example: null,
  })
  deletedAt?: Date | null;
}
