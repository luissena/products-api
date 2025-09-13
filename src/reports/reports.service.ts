import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityFilters } from 'src/shared/types/filter';
import { adaptFiltersToTypeormFilters } from 'src/typeorm/adapters';
import { Product } from 'src/typeorm/entities/product.entity';
import { IsNull, Not, Repository } from 'typeorm';

export interface GetProductsReportsRequest {
  filters: EntityFilters<typeof Product>;
}

export interface PriceReport {
  withPrice: number;
  withoutPrice: number;
}

export type ProductGroupStats = {
  percentage: number;
  priceReport: PriceReport;
};

export interface GetProductsReportsResponse {
  deletedProducts: ProductGroupStats;
  notDeletedProducts: ProductGroupStats;
}

interface ProductStats {
  total: number;
  withPrice: number;
  withoutPrice: number;
}

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  async get(
    request: GetProductsReportsRequest,
  ): Promise<GetProductsReportsResponse> {
    try {
      this.logger.log(
        'Generating product reports with filters',
        request.filters,
      );

      const stats = await this.calculateProductStatistics(request.filters);

      const response = this.buildReportResponse(stats);

      this.logger.log('Product reports generated successfully');
      return response;
    } catch (error) {
      this.logger.error('Error generating product reports', error);
      throw error;
    }
  }

  private async calculateProductStatistics(
    filters: EntityFilters<typeof Product>,
  ): Promise<{
    total: number;
    deletedStats: ProductStats;
    notDeletedStats: ProductStats;
  }> {
    const baseFilters = adaptFiltersToTypeormFilters(filters);

    const total = await this.productsRepository.count({
      where: {
        ...baseFilters,
      },
    });

    if (total === 0) {
      return {
        total: 0,
        deletedStats: { total: 0, withPrice: 0, withoutPrice: 0 },
        notDeletedStats: { total: 0, withPrice: 0, withoutPrice: 0 },
      };
    }

    const deletedStats = await this.calculateGroupStats(baseFilters, true);
    const notDeletedStats = await this.calculateGroupStats(baseFilters, false);

    return {
      total,
      deletedStats,
      notDeletedStats,
    };
  }

  private async calculateGroupStats(
    baseFilters: any,
    isDeleted: boolean,
  ): Promise<ProductStats> {
    const whereConditions = {
      ...baseFilters,
      deletedAt: isDeleted ? Not(IsNull()) : IsNull(),
    };

    const [total, withPrice] = await Promise.all([
      this.productsRepository.count({ where: whereConditions }),
      this.productsRepository.count({
        where: {
          ...whereConditions,
          price: Not(IsNull()),
        },
      }),
    ]);

    return {
      total,
      withPrice,
      withoutPrice: total - withPrice,
    };
  }

  private buildReportResponse(stats: {
    total: number;
    deletedStats: ProductStats;
    notDeletedStats: ProductStats;
  }): GetProductsReportsResponse {
    const { total, deletedStats, notDeletedStats } = stats;

    return {
      deletedProducts: this.buildGroupStats(deletedStats, total),
      notDeletedProducts: this.buildGroupStats(notDeletedStats, total),
    };
  }

  private buildGroupStats(
    groupStats: ProductStats,
    totalProducts: number,
  ): ProductGroupStats {
    const percentage =
      totalProducts > 0 ? (groupStats.total / totalProducts) * 100 : 0;

    return {
      percentage: this.roundToTwoDecimals(percentage),
      priceReport: {
        withPrice: this.calculatePercentage(
          groupStats.withPrice,
          groupStats.total,
        ),
        withoutPrice: this.calculatePercentage(
          groupStats.withoutPrice,
          groupStats.total,
        ),
      },
    };
  }

  private calculatePercentage(value: number, total: number): number {
    return total > 0 ? this.roundToTwoDecimals((value / total) * 100) : 0;
  }

  private roundToTwoDecimals(value: number): number {
    return Math.round(value * 100) / 100;
  }
}
