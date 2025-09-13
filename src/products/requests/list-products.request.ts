import { Type } from 'class-transformer';
import { IsOptional, ValidateNested } from 'class-validator';
import { ListProductsFiltersDTO } from '../dtos/list-products-filters.dto';
import { ListProductsOrdersDTO } from '../dtos/list-products-orders.dto';
import { ListProductsPaginationDTO } from '../dtos/list-products-pagination.dto';

export class ListProductsRequest {
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
