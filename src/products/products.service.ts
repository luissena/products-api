import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPaginationInput } from 'src/shared/interfaces/pagination.interface';
import { EntityFilters } from 'src/shared/types/filter';
import { EntityOrders } from 'src/shared/types/order';
import { adaptFiltersToTypeormFilters } from 'src/typeorm/adapters';
import { Product } from 'src/typeorm/entities/product.entity';
import { UpsertProduct } from 'src/typeorm/types';
import { IsNull, Repository } from 'typeorm';

export type ListProductsRequest = {
  pagination: IPaginationInput;
  filters: EntityFilters<typeof Product>;
  order: EntityOrders<typeof Product>;
};

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  async list({ pagination, filters, order }: ListProductsRequest) {
    const [results, total] = await this.productsRepository.findAndCount({
      where: {
        ...adaptFiltersToTypeormFilters(filters),
        deletedAt: IsNull(),
      },
      skip: pagination.skip,
      take: pagination.limit,
      order,
    });

    return {
      results,
      pagination: {
        total,
        ...pagination,
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
    await this.productsRepository.update(
      {
        id,
      },
      {
        deletedAt: new Date(),
      },
    );
  }
}
