import { ProductItem } from 'src/integrations/contentful/types';
import { INTEGRATIONS } from './constants';
import { UpsertProduct } from './types';

export const productMapper = (product: ProductItem): UpsertProduct => {
  const { fields, sys } = product;
  const { brand, category, color, currency, model, name, price, sku, stock } =
    fields;

  const { id, createdAt, updatedAt } = sys;

  return {
    brand: brand['en-US'],
    category: category['en-US'],
    color: color['en-US'],
    currency: currency['en-US'],
    model: model['en-US'],
    name: name['en-US'],
    price: price['en-US'],
    sku: sku['en-US'],
    stock: stock['en-US'],
    createdAt,
    updatedAt,
    integration: INTEGRATIONS.contentful,
    externalId: id,
  };
};
