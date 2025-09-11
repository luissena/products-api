import { Controller, Delete, Get, Param, Query } from '@nestjs/common';
import { ListProductsDTO } from './dtos/list-products.dto';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  list(@Query() { filters, pagination, order }: ListProductsDTO) {
    return this.productsService.list({
      pagination,
      filters,
      order,
    });
  }

  @Delete(':id')
  softDelete(@Param('id') id: string) {
    return this.productsService.softDelete(id);
  }
}
