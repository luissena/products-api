import {
  And,
  Equal,
  FindOperator,
  IsNull,
  LessThan,
  LessThanOrEqual,
  MoreThan,
  MoreThanOrEqual,
  Not,
} from 'typeorm';
import {
  EntityFilters,
  FilterValue,
  TypeFilterValueType,
} from '../shared/types/filter';

/** Adapter function signature */
export type AdapterFunction = (value: TypeFilterValueType) => FindOperator<any>;

/** TypeORM filter adapters */
export const typeORMFilterAdapters: Record<string, AdapterFunction> = {
  equal: (value: TypeFilterValueType) => Equal(value),
  gt: (value: TypeFilterValueType) => MoreThan(value),
  gte: (value: TypeFilterValueType) => MoreThanOrEqual(value),
  lt: (value: TypeFilterValueType) => LessThan(value),
  lte: (value: TypeFilterValueType) => LessThanOrEqual(value),
  exists: (value: TypeFilterValueType) =>
    value === false || value === 'false' ? IsNull() : Not(IsNull()),
};

/** Adapt a single filter to a TypeORM FindOperator */
export const adaptFilterToTypeormFilter = <T extends TypeFilterValueType>(
  filter: FilterValue<T>,
): FindOperator<any> | T | undefined => {
  if (
    typeof filter === 'string' ||
    typeof filter === 'number' ||
    filter instanceof String
  ) {
    return filter as T;
  }

  if (filter instanceof Date) {
    return Equal(filter);
  }

  if (filter && typeof filter === 'object') {
    const filterObj = filter as Partial<Record<string, TypeFilterValueType>>;
    const keys = Object.keys(filterObj);

    if (keys.length === 0) return undefined;

    if (keys.length === 1) {
      const key = keys[0];
      const value = filterObj[key];
      if (value === undefined) return undefined;
      return typeORMFilterAdapters[key](value);
    }

    const operators = keys
      .map((key) => {
        const value = filterObj[key];
        return value === undefined
          ? undefined
          : typeORMFilterAdapters[key](value);
      })
      .filter((op): op is FindOperator<any> => op !== undefined);

    return operators.length ? And(...operators) : undefined;
  }

  return undefined;
};

/** Adapt multiple filters for an entity */
export const adaptFiltersToTypeormFilters = <
  Entity extends Record<string, any>,
>(
  filters: EntityFilters<Entity>,
):
  | Partial<Record<keyof Entity, FindOperator<any> | TypeFilterValueType>>
  | undefined => {
  if (!filters) return undefined;

  return Object.entries(filters).reduce(
    (acc, [propertyName, filterValue]) => {
      const adapted = adaptFilterToTypeormFilter(
        filterValue as FilterValue<TypeFilterValueType>,
      );
      if (adapted !== undefined) {
        (acc as Record<string, TypeFilterValueType | FindOperator<any>>)[
          propertyName
        ] = adapted;
      }
      return acc;
    },
    {} as Partial<
      Record<keyof Entity, TypeFilterValueType | FindOperator<any>>
    >,
  );
};
