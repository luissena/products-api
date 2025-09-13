/**
 * Supported order values for sorting
 *
 * @typedef {'ASC' | 'DESC'} OrderValue
 */
export type OrderValue = 'ASC' | 'DESC';

/**
 * Generic type for entity ordering based on entity prototype properties
 *
 * @template Entity - Entity type with prototype property
 * @typedef {Object} EntityOrders
 * @property {OrderValue} [key] - Sort order for each entity property
 */
export type EntityOrders<Entity extends { prototype?: any }> = Partial<{
  [key in keyof Entity['prototype']]: OrderValue;
}>;
