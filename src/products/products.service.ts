import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { IPaginationInput } from './../shared/interfaces/pagination.interface';
import { EntityFilters } from './../shared/types/filter';
import { EntityOrders } from './../shared/types/order';
import { adaptFiltersToTypeormFilters } from './../typeorm/adapters';
import { Product } from './../typeorm/entities/product.entity';
import { UpsertProduct } from './../typeorm/types';
import {
  LIST_PRODUCTS_DEFAULT_LIMIT,
  LIST_PRODUCTS_DEFAULT_SKIP,
} from './constants';

/**
 * Request type for listing products with filtering, pagination, and ordering
 *
 * @typedef {Object} ListProductsRequest
 * @property {IPaginationInput} [pagination] - Pagination parameters (skip, limit)
 * @property {EntityFilters<typeof Product>} [filters] - Advanced filtering options
 * @property {EntityOrders<typeof Product>} [order] - Sorting/ordering options
 */
export type ListProductsRequest = {
  pagination?: IPaginationInput;
  filters?: EntityFilters<typeof Product>;
  order?: EntityOrders<typeof Product>;
};

/**
 * Products Service
 *
 * This service handles all product-related business logic including listing,
 * creating, updating, and soft deleting products. It provides advanced filtering,
 * pagination, and sorting capabilities.
 *
 * @class ProductsService
 */
@Injectable()
export class ProductsService {
  /**
   * Creates an instance of ProductsService
   *
   * @param {Repository<Product>} productsRepository - TypeORM repository for Product entity
   */
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  /**
   * Retrieves a paginated list of products with advanced filtering and sorting
   *
   * This method supports complex filtering using nested query parameters,
   * pagination with configurable skip/limit, and sorting by any product field.
   * Only non-deleted products are returned (deletedAt is null).
   *
   * @param {ListProductsRequest} params - Request parameters for listing products
   * @param {IPaginationInput} [params.pagination] - Pagination settings (skip, limit)
   * @param {EntityFilters<typeof Product>} [params.filters] - Advanced filtering options
   * @param {EntityOrders<typeof Product>} [params.order] - Sorting/ordering options
   * @returns {Promise<Object>} Paginated list of products with metadata
   * @returns {Product[]} returns.results - Array of product entities
   * @returns {Object} returns.pagination - Pagination metadata
   * @returns {number} returns.pagination.total - Total number of products matching filters
   * @returns {number} returns.pagination.skip - Number of records skipped
   * @returns {number} returns.pagination.limit - Number of records returned
   *
   * @example
   * ```typescript
   * // Get first 10 products with Apple brand
   * const products = await productsService.list({
   *   pagination: { skip: 0, limit: 10 },
   *   filters: { brand: { equal: 'Apple' } },
   *   order: { createdAt: 'DESC' }
   * });
   * ```
   */
  async list({ pagination, filters, order }: ListProductsRequest) {
    const { skip, limit } = pagination ?? {
      skip: LIST_PRODUCTS_DEFAULT_SKIP,
      limit: LIST_PRODUCTS_DEFAULT_LIMIT,
    };

    const [results, total] = await this.productsRepository.findAndCount({
      where: {
        ...adaptFiltersToTypeormFilters(filters ?? {}),
        deletedAt: IsNull(),
      },
      skip,
      take: limit,
      order,
    });

    return {
      results,
      pagination: {
        total,
        skip,
        limit,
      },
    };
  }

  /**
   * Creates a new product or updates an existing one based on integration and external ID
   *
   * This method performs an upsert operation (insert or update) based on the combination
   * of integration and externalId fields. If a product with the same integration and
   * externalId exists, it will be updated; otherwise, a new product will be created.
   *
   * @param {UpsertProduct} product - Product data to create or update
   * @returns {Promise<void>} Resolves when the upsert operation is complete
   *
   * @example
   * ```typescript
   * await productsService.upsert({
   *   integration: 'contentful',
   *   externalId: 'contentful-123',
   *   name: 'iPhone 15 Pro',
   *   brand: 'Apple',
   *   price: 999.99
   * });
   * ```
   */
  async upsert(product: UpsertProduct): Promise<void> {
    await this.productsRepository.upsert(product, {
      conflictPaths: ['integration', 'externalId'],
    });
  }

  /**
   * Deletes all products from the database
   *
   * This method performs a hard delete of all products in the database.
   * Use with caution as this operation cannot be undone.
   *
   * @returns {Promise<void>} Resolves when all products are deleted
   *
   * @example
   * ```typescript
   * await productsService.deleteAll();
   * console.log('All products deleted');
   * ```
   */
  async deleteAll(): Promise<void> {
    await this.productsRepository.deleteAll();
  }

  /**
   * Soft deletes a product by setting its deletedAt timestamp
   *
   * This method marks a product as deleted without actually removing it from the database.
   * The product will not appear in future queries but remains in the database for audit purposes.
   *
   * @param {string} id - The UUID of the product to soft delete
   * @returns {Promise<number>} Number of affected rows (0 if product not found)
   *
   * @example
   * ```typescript
   * const affected = await productsService.softDelete('123e4567-e89b-12d3-a456-426614174000');
   * if (affected > 0) {
   *   console.log('Product soft deleted successfully');
   * } else {
   *   console.log('Product not found');
   * }
   * ```
   */
  async softDelete(id: string): Promise<number> {
    const result = await this.productsRepository.update(
      {
        id,
      },
      {
        deletedAt: new Date(),
      },
    );

    return result.affected || 0;
  }
}
