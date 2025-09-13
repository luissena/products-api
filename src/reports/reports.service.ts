import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { EntityFilters } from './../shared/types/filter';
import { adaptFiltersToTypeormFilters } from './../typeorm/adapters';
import { Product } from './../typeorm/entities/product.entity';

/**
 * Request interface for generating product reports
 *
 * @interface GetProductsReportsRequest
 * @property {EntityFilters<typeof Product>} filters - Advanced filtering options for products
 */
export interface GetProductsReportsRequest {
  filters: EntityFilters<typeof Product>;
}

/**
 * Price report statistics for a product group
 *
 * @interface PriceReport
 * @property {number} withPrice - Number of products with price information
 * @property {number} withoutPrice - Number of products without price information
 */
export interface PriceReport {
  withPrice: number;
  withoutPrice: number;
}

/**
 * Statistics for a product group (deleted or not deleted)
 *
 * @typedef {Object} ProductGroupStats
 * @property {number} percentage - Percentage of total products this group represents
 * @property {PriceReport} priceReport - Price statistics for this group
 */
export type ProductGroupStats = {
  percentage: number;
  priceReport: PriceReport;
};

/**
 * Response interface for product reports
 *
 * @interface GetProductsReportsResponse
 * @property {ProductGroupStats} deletedProducts - Statistics for deleted products
 * @property {ProductGroupStats} notDeletedProducts - Statistics for active products
 */
export interface GetProductsReportsResponse {
  deletedProducts: ProductGroupStats;
  notDeletedProducts: ProductGroupStats;
}

/**
 * Internal interface for product statistics calculations
 *
 * @interface ProductStats
 * @property {number} total - Total number of products
 * @property {number} withPrice - Number of products with price information
 * @property {number} withoutPrice - Number of products without price information
 */
interface ProductStats {
  total: number;
  withPrice: number;
  withoutPrice: number;
}

/**
 * Reports Service
 *
 * This service handles the generation of comprehensive product reports including
 * price analysis, stock analysis, brand distribution, category analysis, and
 * price range distribution. It provides detailed statistics about products
 * based on specified filters.
 *
 * @class ReportsService
 */
@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  /**
   * Creates an instance of ReportsService
   *
   * @param {Repository<Product>} productsRepository - TypeORM repository for Product entity
   */
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  /**
   * Generates comprehensive product reports based on specified filters
   *
   * This method creates detailed reports about products including statistics
   * for deleted and active products, price analysis, and percentage calculations.
   * The reports are filtered based on the provided criteria.
   *
   * @param {GetProductsReportsRequest} request - Request containing filters for report generation
   * @returns {Promise<GetProductsReportsResponse>} Comprehensive product report with statistics
   *
   * @example
   * ```typescript
   * const report = await reportsService.get({
   *   filters: {
   *     brand: { equal: 'Apple' },
   *     price: { gt: 100 }
   *   }
   * });
   *
   * console.log(`Active products: ${report.notDeletedProducts.percentage}%`);
   * console.log(`With price: ${report.notDeletedProducts.priceReport.withPrice}%`);
   * ```
   */
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

  /**
   * Calculates comprehensive product statistics based on filters
   *
   * @private
   * @param {EntityFilters<typeof Product>} filters - Filters to apply to product queries
   * @returns {Promise<Object>} Statistics object containing total, deleted, and active product stats
   */
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

    const deletedStats = await this.calculateGroupStats(
      baseFilters || {},
      true,
    );
    const notDeletedStats = await this.calculateGroupStats(
      baseFilters || {},
      false,
    );

    return {
      total,
      deletedStats,
      notDeletedStats,
    };
  }

  /**
   * Calculates statistics for a specific product group (deleted or active)
   *
   * @private
   * @param {Record<string, any>} baseFilters - Base filters to apply
   * @param {boolean} isDeleted - Whether to calculate stats for deleted products
   * @returns {Promise<ProductStats>} Statistics for the specified product group
   */
  private async calculateGroupStats(
    baseFilters: Record<string, any>,
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

  /**
   * Builds the final report response from calculated statistics
   *
   * @private
   * @param {Object} stats - Calculated product statistics
   * @param {number} stats.total - Total number of products
   * @param {ProductStats} stats.deletedStats - Statistics for deleted products
   * @param {ProductStats} stats.notDeletedStats - Statistics for active products
   * @returns {GetProductsReportsResponse} Formatted report response
   */
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

  /**
   * Builds statistics for a product group with percentage calculations
   *
   * @private
   * @param {ProductStats} groupStats - Raw statistics for the group
   * @param {number} totalProducts - Total number of products for percentage calculation
   * @returns {ProductGroupStats} Formatted group statistics with percentages
   */
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

  /**
   * Calculates percentage with two decimal precision
   *
   * @private
   * @param {number} value - Value to calculate percentage for
   * @param {number} total - Total value for percentage calculation
   * @returns {number} Percentage rounded to two decimal places
   */
  private calculatePercentage(value: number, total: number): number {
    return total > 0 ? this.roundToTwoDecimals((value / total) * 100) : 0;
  }

  /**
   * Rounds a number to two decimal places
   *
   * @private
   * @param {number} value - Number to round
   * @returns {number} Number rounded to two decimal places
   */
  private roundToTwoDecimals(value: number): number {
    return Math.round(value * 100) / 100;
  }
}
