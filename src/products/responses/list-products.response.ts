import { ApiProperty } from '@nestjs/swagger';
import { ProductDTO } from '../dtos/product.dto';

export class PaginationDTO {
  @ApiProperty({
    description: 'Total number of products matching filters',
    type: 'integer',
    example: 150,
  })
  total: number;

  @ApiProperty({
    description: 'Number of records skipped',
    type: 'integer',
    example: 0,
  })
  skip: number;

  @ApiProperty({
    description: 'Number of records returned',
    type: 'integer',
    example: 5,
  })
  limit: number;
}

export class ListProductsResponse {
  @ApiProperty({
    description: 'Array of products matching the query criteria',
    type: [ProductDTO],
    isArray: true,
  })
  results: ProductDTO[];

  @ApiProperty({
    description: 'Pagination information',
    type: PaginationDTO,
  })
  pagination: PaginationDTO;
}
