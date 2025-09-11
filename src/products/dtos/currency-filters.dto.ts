import { Length } from 'class-validator';
import { IsTextFilter } from '../../shared/dtos/validators';

export class CurrencyFiltersDTO {
  @IsTextFilter(Length(3))
  equal?: string;
}
