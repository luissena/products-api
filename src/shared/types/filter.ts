export type EntityFilters<Entity extends { prototype?: any }> = Partial<{
  [key in keyof Entity['prototype']]: FilterValue<Entity['prototype'][key]>;
}>;

export type TypeFilterValueType = string | number | boolean | Date;
export interface AdvancedFilters<Type extends TypeFilterValueType> {
  equal?: Type;
  gt?: Type;
  gte?: Type;
  lt?: Type;
  lte?: Type;
  exists?: boolean | 'true' | 'false';
}

export type FilterValue<Type extends TypeFilterValueType> =
  | Type
  | AdvancedFilters<Type>;
