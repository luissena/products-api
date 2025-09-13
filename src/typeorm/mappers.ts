import { ProductItem } from './../integrations/contentful/types';
import { INTEGRATIONS } from './constants';
import { UpsertProduct } from './types';

interface ContentfulField {
  'en-US': string | number;
}

export const productMapper = (product: ProductItem): UpsertProduct => {
  const { fields, sys } = product;
  const { brand, category, color, currency, model, name, price, sku, stock } =
    fields;

  const { id, createdAt, updatedAt } = sys;

  return {
    brand: (brand as unknown as ContentfulField)['en-US'] as string,
    category: (category as unknown as ContentfulField)['en-US'] as string,
    color: (color as unknown as ContentfulField)['en-US'] as string,
    currency: (currency as unknown as ContentfulField)['en-US'] as string,
    model: (model as unknown as ContentfulField)['en-US'] as string,
    name: (name as unknown as ContentfulField)['en-US'] as string,
    price: (price as unknown as ContentfulField)['en-US'] as number,
    sku: (sku as unknown as ContentfulField)['en-US'] as string,
    stock: (stock as unknown as ContentfulField)['en-US'] as number,
    createdAt,
    updatedAt,
    integration: INTEGRATIONS.contentful,
    externalId: id,
  };
};
