import { Product } from '../entities/product.entity';

export type UpsertProduct = Omit<Product, 'id'> & { id?: Product['id'] };
