import { AdvancedFilters } from '../types/filter';
import { IsNumberFilter } from './validators';

export const createNumberFilters = () => {
  class NumberFilters implements Partial<AdvancedFilters<number>> {
    @IsNumberFilter()
    equal?: number;

    @IsNumberFilter()
    gt?: number;

    @IsNumberFilter()
    gte?: number;

    @IsNumberFilter()
    lt?: number;

    @IsNumberFilter()
    lte?: number;
  }

  return NumberFilters;
};
