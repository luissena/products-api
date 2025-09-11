import { Type } from 'class-transformer';
import { IsOptional, ValidateNested } from 'class-validator';
import { ListProductsFiltersDTO } from './list-products-filters.dto';
import { ListProductsOrdersDTO } from './list-products-orders.dto';
import { ListProductsPaginationDTO } from './list-products-pagination.dto';

export class ListProductsDTO {
  @IsOptional()
  @ValidateNested()
  @Type(() => ListProductsPaginationDTO)
  pagination: ListProductsPaginationDTO;

  @IsOptional()
  @ValidateNested()
  @Type(() => ListProductsFiltersDTO)
  filters: ListProductsFiltersDTO;

  @IsOptional()
  @ValidateNested()
  @Type(() => ListProductsOrdersDTO)
  order: ListProductsOrdersDTO;
}
