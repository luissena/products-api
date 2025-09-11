import { Type } from 'class-transformer';
import { IsOptional, ValidateNested } from 'class-validator';
import { createDateFilters } from '../../shared/dtos/date-string-filters';
import { createNumberFilters } from '../../shared/dtos/number-filters';
import { createTextFilters } from '../../shared/dtos/text-filters';
import { CurrencyFiltersDTO } from './currency-filters.dto';

const SKUFiltersDTO = createTextFilters('sku');
const NameFiltersDTO = createTextFilters('name');
const BrandFiltersDTO = createTextFilters('brand');
const ModelFiltersDTO = createTextFilters('model');
const CategoryFiltersDTO = createTextFilters('category');
const ColorFiltersDTO = createTextFilters('color');

const PriceFiltersDTO = createNumberFilters('price');
const StockFiltersDTO = createNumberFilters('stock');
const CreatedAtFiltersDTO = createDateFilters('createdAt');
const UpdatedAtFiltersDTO = createDateFilters('updatedAt');
const DeletedAtFiltersDTO = createDateFilters('deletedAt');

export class ListProductsFiltersDTO {
  @ValidateNested()
  @Type(() => SKUFiltersDTO)
  sku?: InstanceType<typeof SKUFiltersDTO>;

  @ValidateNested()
  @Type(() => NameFiltersDTO)
  name?: InstanceType<typeof NameFiltersDTO>;

  @ValidateNested()
  @Type(() => BrandFiltersDTO)
  brand?: InstanceType<typeof BrandFiltersDTO>;

  @ValidateNested()
  @Type(() => ModelFiltersDTO)
  model?: InstanceType<typeof ModelFiltersDTO>;

  @ValidateNested()
  @Type(() => CategoryFiltersDTO)
  category?: InstanceType<typeof CategoryFiltersDTO>;

  @ValidateNested()
  @Type(() => ColorFiltersDTO)
  color?: InstanceType<typeof ColorFiltersDTO>;

  @ValidateNested()
  @Type(() => PriceFiltersDTO)
  @IsOptional()
  price?: InstanceType<typeof PriceFiltersDTO>;

  @ValidateNested()
  @Type(() => CurrencyFiltersDTO)
  @IsOptional()
  currency?: InstanceType<typeof CurrencyFiltersDTO>;

  @ValidateNested()
  @Type(() => StockFiltersDTO)
  @IsOptional()
  stock?: InstanceType<typeof StockFiltersDTO>;

  @ValidateNested()
  @Type(() => CreatedAtFiltersDTO)
  createdAt?: InstanceType<typeof CreatedAtFiltersDTO>;

  @ValidateNested()
  @Type(() => UpdatedAtFiltersDTO)
  updatedAt?: InstanceType<typeof UpdatedAtFiltersDTO>;

  @ValidateNested()
  @Type(() => DeletedAtFiltersDTO)
  deletedAt?: InstanceType<typeof DeletedAtFiltersDTO>;
}
