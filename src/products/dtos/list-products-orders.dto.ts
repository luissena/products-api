import { IsOrderFilter } from '../../shared/dtos/validators';
import type { OrderValue } from '../../shared/types/order';

export class ListProductsOrdersDTO {
  @IsOrderFilter()
  sku?: OrderValue;
}
