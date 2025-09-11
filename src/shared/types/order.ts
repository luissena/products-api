export type OrderValue = 'ASC' | 'DESC';

export type EntityOrders<Entity extends { prototype?: any }> = Partial<{
  [key in keyof Entity['prototype']]: OrderValue;
}>;
