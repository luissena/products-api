import { AdvancedFilters } from '../types/filter';
import { IsDateFilter } from './validators';

export const createDateFilters = (propertyPrefix: string) => {
  class DateFilters implements Partial<AdvancedFilters<Date>> {
    @IsDateFilter()
    equal?: Date;

    @IsDateFilter()
    gt?: Date;

    @IsDateFilter()
    gte?: Date;

    @IsDateFilter()
    lt?: Date;

    @IsDateFilter()
    lte?: Date;
  }

  return DateFilters;
};
