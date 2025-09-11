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

/**
 * Defines the adapter function signature for transforming filter values
 * into TypeORM FindOperator instances.
 */
export type AdpterFunction = (value: TypeFilterValueType) => FindOperator<any>;

/**
 * An object containing adapter functions for converting simple filter criteria
 * into TypeORM FindOperator instances for database querying.
 */
export const typeORMFilterAdapters: {
  equal: AdpterFunction;
  gt: AdpterFunction;
  gte: AdpterFunction;
  lt: AdpterFunction;
  lte: AdpterFunction;
  exists: AdpterFunction;
} = {
  equal: (value: TypeFilterValueType) => {
    return Equal(value);
  },
  gt: (value: TypeFilterValueType) => {
    return MoreThan(value);
  },
  gte: (value: TypeFilterValueType) => {
    return MoreThanOrEqual(value);
  },
  lt: (value: TypeFilterValueType) => {
    return LessThan(value);
  },
  lte: (value: TypeFilterValueType) => {
    return LessThanOrEqual(value);
  },
  exists: (value: TypeFilterValueType) => {
    if (value === false || value === 'false') {
      return IsNull();
    }

    return Not(IsNull());
  },
};

/**
 * Adapts a filter value into a corresponding TypeORM FindOperator, handling
 * both simple values and advanced filter objects.
 *
 * @template Type - The expected type of the filter value, extending TypeFilterValueType.
 * @param {FilterValue<Type>} filter - The filter value, which can be a simple value
 * or an object describing an advanced filter.
 * @returns {Type | FindOperator<any> | undefined} The adapted filter as a TypeORM FindOperator,
 * the original value if it's a simple type, or undefined if the filter cannot be adapted.
 */
export const adaptFilterToTypeormFilter = <Type extends TypeFilterValueType>(
  filter: FilterValue<Type>,
): Type | FindOperator<any> | undefined => {
  if (typeof filter === 'string' || filter instanceof String) {
    return filter as Type;
  }

  if (filter instanceof Date) {
    return Equal(filter);
  }

  if (filter instanceof Object) {
    const keys = Object.keys(filter) as (keyof typeof typeORMFilterAdapters)[];

    if (keys.length === 0) {
      return undefined;
    }

    if (keys.length === 1) {
      const key = keys[0];
      const adapter = typeORMFilterAdapters[key];
      const value = (filter as any)[key] as TypeFilterValueType | undefined;
      if (value === undefined) return undefined;
      return adapter(value);
    } else {
      const operators = keys
        .map((key) => {
          const adapter = typeORMFilterAdapters[key];
          const value = (filter as any)[key] as TypeFilterValueType | undefined;
          return value === undefined ? undefined : adapter(value);
        })
        .filter((op): op is FindOperator<any> => op !== undefined);

      return operators.length ? And(...operators) : undefined;
    }
  }
  return undefined;
};

export const adaptFiltersToTypeormFilters = <
  Entity extends { prototype?: any },
>(
  filters: EntityFilters<Entity>,
):
  | undefined
  | Partial<
      Record<keyof Entity['prototype'], FindOperator<any> | TypeFilterValueType>
    > => {
  if (!filters) return undefined;

  return Object.entries(filters).reduce(
    (acc, [propertyName, filterValue]) => {
      const adapted = adaptFilterToTypeormFilter(filterValue as any);
      if (adapted !== undefined) {
        (acc as any)[propertyName as keyof Entity['prototype']] =
          adapted as any;
      }

      return acc;
    },
    {} as Partial<
      Record<keyof Entity['prototype'], FindOperator<any> | TypeFilterValueType>
    >,
  );
};
