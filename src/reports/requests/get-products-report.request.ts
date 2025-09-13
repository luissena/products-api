import { Type } from 'class-transformer';
import { IsOptional, ValidateNested } from 'class-validator';
import { ListProductsFiltersDTO } from '../../products/dtos/list-products-filters.dto';

export class GetProductsReportRequest {
  @IsOptional()
  @ValidateNested()
  @Type(() => ListProductsFiltersDTO)
  filters: ListProductsFiltersDTO;
}
