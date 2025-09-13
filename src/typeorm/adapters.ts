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
 * Function signature for TypeORM filter adapters
 *
 * @typedef {function} AdapterFunction
 * @param {TypeFilterValueType} value - The value to create a filter operator for
 * @returns {FindOperator<any>} TypeORM FindOperator for the filter
 */
export type AdapterFunction = (value: TypeFilterValueType) => FindOperator<any>;

/**
 * TypeORM filter adapters mapping filter operators to TypeORM FindOperators
 *
 * Maps custom filter operators (equal, gt, gte, lt, lte, exists) to their
 * corresponding TypeORM FindOperator implementations.
 *
 * @constant {Record<string, AdapterFunction>} typeORMFilterAdapters
 * @property {AdapterFunction} equal - Creates Equal operator
 * @property {AdapterFunction} gt - Creates MoreThan operator
 * @property {AdapterFunction} gte - Creates MoreThanOrEqual operator
 * @property {AdapterFunction} lt - Creates LessThan operator
 * @property {AdapterFunction} lte - Creates LessThanOrEqual operator
 * @property {AdapterFunction} exists - Creates IsNull or Not(IsNull) operator
 */
export const typeORMFilterAdapters: Record<string, AdapterFunction> = {
  equal: (value: TypeFilterValueType) => Equal(value),
  gt: (value: TypeFilterValueType) => MoreThan(value),
  gte: (value: TypeFilterValueType) => MoreThanOrEqual(value),
  lt: (value: TypeFilterValueType) => LessThan(value),
  lte: (value: TypeFilterValueType) => LessThanOrEqual(value),
  exists: (value: TypeFilterValueType) =>
    value === false || value === 'false' ? IsNull() : Not(IsNull()),
};

/**
 * Adapts a single filter value to a TypeORM FindOperator or primitive value
 *
 * This function converts custom filter values into TypeORM-compatible operators.
 * It handles both primitive values (direct equality) and advanced filter objects
 * with multiple operators (combined with And).
 *
 * @template T - Type of the filter value
 * @param {FilterValue<T>} filter - Filter value to adapt (primitive or advanced filter object)
 * @returns {FindOperator<any> | T | undefined} TypeORM FindOperator, primitive value, or undefined
 *
 * @example
 * ```typescript
 * // Direct value
 * const directFilter = adaptFilterToTypeormFilter('Apple'); // Returns 'Apple'
 *
 * // Advanced filter
 * const advancedFilter = adaptFilterToTypeormFilter({ gt: 100, lt: 500 });
 * // Returns And(MoreThan(100), LessThan(500))
 * ```
 */
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

/**
 * Adapts multiple entity filters to TypeORM-compatible filters
 *
 * This function processes an entire entity filter object, converting each
 * property's filter value to its corresponding TypeORM representation.
 * Properties with undefined or invalid filters are excluded from the result.
 *
 * @template Entity - Entity type with string keys
 * @param {EntityFilters<Entity>} filters - Entity filters to adapt
 * @returns {Partial<Record<keyof Entity, FindOperator<any> | TypeFilterValueType>> | undefined}
 *          TypeORM-compatible filters or undefined if no valid filters
 *
 * @example
 * ```typescript
 * const entityFilters = {
 *   brand: 'Apple',
 *   price: { gt: 100, lt: 500 },
 *   stock: { gte: 0 }
 * };
 *
 * const typeormFilters = adaptFiltersToTypeormFilters(entityFilters);
 * // Returns: {
 * //   brand: 'Apple',
 * //   price: And(MoreThan(100), LessThan(500)),
 * //   stock: MoreThanOrEqual(0)
 * // }
 * ```
 */
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
