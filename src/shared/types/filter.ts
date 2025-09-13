/**
 * Generic type for entity filters based on entity prototype properties
 *
 * @template Entity - Entity type with prototype property
 * @typedef {Object} EntityFilters
 * @property {FilterValue} [key] - Filter value for each entity property
 */
export type EntityFilters<Entity extends { prototype?: any }> = Partial<{
  [key in keyof Entity['prototype']]: FilterValue<Entity['prototype'][key]>;
}>;

/**
 * Supported filter value types
 *
 * @typedef {string | number | boolean | Date} TypeFilterValueType
 */
export type TypeFilterValueType = string | number | boolean | Date;

/**
 * Advanced filter operators for complex querying
 *
 * @interface AdvancedFilters
 * @template Type - Type of the value being filtered
 * @property {Type} [equal] - Exact match
 * @property {Type} [gt] - Greater than
 * @property {Type} [gte] - Greater than or equal
 * @property {Type} [lt] - Less than
 * @property {Type} [lte] - Less than or equal
 * @property {boolean | 'true' | 'false'} [exists] - Check if field exists/has value
 */
export interface AdvancedFilters<Type extends TypeFilterValueType> {
  equal?: Type;
  gt?: Type;
  gte?: Type;
  lt?: Type;
  lte?: Type;
  exists?: boolean | 'true' | 'false';
}

/**
 * Union type for filter values - can be direct value or advanced filter object
 *
 * @template Type - Type of the value being filtered
 * @typedef {Type | AdvancedFilters<Type>} FilterValue
 */
export type FilterValue<Type extends TypeFilterValueType> =
  | Type
  | AdvancedFilters<Type>;
