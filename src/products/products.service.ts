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

export type ListProductsRequest = {
  pagination?: IPaginationInput;
  filters?: EntityFilters<typeof Product>;
  order?: EntityOrders<typeof Product>;
};

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

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

  async upsert(product: UpsertProduct) {
    await this.productsRepository.upsert(product, {
      conflictPaths: ['integration', 'externalId'],
    });
  }

  async deleteAll() {
    await this.productsRepository.deleteAll();
  }

  async softDelete(id: string) {
    const result = await this.productsRepository.update(
      {
        id,
      },
      {
        deletedAt: new Date(),
      },
    );

    return result.affected;
  }
}
