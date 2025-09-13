import { AdvancedFilters } from '../types/filter';
import { IsTextFilter } from './validators';

export const createTextFilters = () => {
  class TextFilters implements Partial<AdvancedFilters<string>> {
    @IsTextFilter()
    equal?: string;

    @IsTextFilter()
    gt?: string;

    @IsTextFilter()
    gte?: string;

    @IsTextFilter()
    lt?: string;

    @IsTextFilter()
    lte?: string;
  }

  return TextFilters;
};
