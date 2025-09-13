import { ApiProperty } from '@nestjs/swagger';
class PriceReport {
  @ApiProperty({
    description: 'Number of products with defined prices',
    type: 'number',
  })
  withPrice: number;

  @ApiProperty({
    description: 'Number of products without prices',
    type: 'number',
  })
  withoutPrice: number;
}
class ProductGroupStats {
  @ApiProperty({
    description: 'Percentage of products in the group',
    type: 'number',
  })
  percentage: number;

  @ApiProperty({
    description: 'Price report',
    type: PriceReport,
  })
  priceReport: PriceReport;
}

export class ProductsReportsResponse {
  @ApiProperty({
    description: 'Deleted products report',
    type: ProductGroupStats,
  })
  deletedProducts: ProductGroupStats;

  @ApiProperty({
    description: 'Not deleted products report',
    type: ProductGroupStats,
  })
  notDeletedProducts: ProductGroupStats;
}
