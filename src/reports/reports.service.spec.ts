import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from '../typeorm/entities/product.entity';
import { GetProductsReportsRequest, ReportsService } from './reports.service';

// Interface para testes que expõe métodos privados
interface ReportsServiceForTesting extends ReportsService {
  calculateGroupStats(
    baseFilters: Record<string, unknown>,
    isDeleted: boolean,
  ): Promise<{ total: number; withPrice: number; withoutPrice: number }>;
  buildGroupStats(
    groupStats: { total: number; withPrice: number; withoutPrice: number },
    totalProducts: number,
  ): {
    percentage: number;
    priceReport: { withPrice: number; withoutPrice: number };
  };
  roundToTwoDecimals(value: number): number;
}

describe('ReportsService', () => {
  let service: ReportsService;

  const mockRepository = {
    count: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('get', () => {
    it('should generate product reports successfully', async () => {
      const request: GetProductsReportsRequest = {
        filters: { brand: { equal: 'Apple' } },
      };

      // Mock para o total de produtos
      mockRepository.count
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(20) // deleted total
        .mockResolvedValueOnce(15) // deleted with price
        .mockResolvedValueOnce(80) // not deleted total
        .mockResolvedValueOnce(70); // not deleted with price

      const result = await service.get(request);

      expect(result).toEqual({
        deletedProducts: {
          percentage: 20,
          priceReport: {
            withPrice: 75,
            withoutPrice: 25,
          },
        },
        notDeletedProducts: {
          percentage: 80,
          priceReport: {
            withPrice: 87.5,
            withoutPrice: 12.5,
          },
        },
      });

      expect(mockRepository.count).toHaveBeenCalledTimes(5);
    });

    it('should handle empty results when no products match filters', async () => {
      const request: GetProductsReportsRequest = {
        filters: { brand: { equal: 'NonExistent' } },
      };

      mockRepository.count.mockResolvedValueOnce(0); // total

      const result = await service.get(request);

      expect(result).toEqual({
        deletedProducts: {
          percentage: 0,
          priceReport: {
            withPrice: 0,
            withoutPrice: 0,
          },
        },
        notDeletedProducts: {
          percentage: 0,
          priceReport: {
            withPrice: 0,
            withoutPrice: 0,
          },
        },
      });

      expect(mockRepository.count).toHaveBeenCalledTimes(1);
    });

    it('should handle products with no price correctly', async () => {
      const request: GetProductsReportsRequest = {
        filters: {},
      };

      mockRepository.count
        .mockResolvedValueOnce(10) // total
        .mockResolvedValueOnce(5) // deleted total
        .mockResolvedValueOnce(0) // deleted with price
        .mockResolvedValueOnce(5) // not deleted total
        .mockResolvedValueOnce(0); // not deleted with price

      const result = await service.get(request);

      expect(result).toEqual({
        deletedProducts: {
          percentage: 50,
          priceReport: {
            withPrice: 0,
            withoutPrice: 100,
          },
        },
        notDeletedProducts: {
          percentage: 50,
          priceReport: {
            withPrice: 0,
            withoutPrice: 100,
          },
        },
      });
    });

    it('should round percentages to two decimal places', async () => {
      const request: GetProductsReportsRequest = {
        filters: {},
      };

      mockRepository.count
        .mockResolvedValueOnce(3) // total
        .mockResolvedValueOnce(1) // deleted total
        .mockResolvedValueOnce(1) // deleted with price
        .mockResolvedValueOnce(2) // not deleted total
        .mockResolvedValueOnce(1); // not deleted with price

      const result = await service.get(request);

      expect(result.deletedProducts.percentage).toBe(33.33);
      expect(result.notDeletedProducts.percentage).toBe(66.67);
      expect(result.deletedProducts.priceReport.withPrice).toBe(100);
      expect(result.notDeletedProducts.priceReport.withPrice).toBe(50);
    });
  });

  describe('private methods', () => {
    it('should calculate group stats correctly for deleted products', async () => {
      const baseFilters = { brand: { equal: 'Apple' } };

      mockRepository.count
        .mockResolvedValueOnce(20) // total for deleted
        .mockResolvedValueOnce(15); // with price for deleted

      // Usando reflection para testar método privado
      const testService = service as ReportsServiceForTesting;
      const result = await testService.calculateGroupStats(baseFilters, true);

      expect(result).toEqual({
        total: 20,
        withPrice: 15,
        withoutPrice: 5,
      });
    });

    it('should calculate group stats correctly for not deleted products', async () => {
      const baseFilters = { brand: { equal: 'Apple' } };

      mockRepository.count
        .mockResolvedValueOnce(80) // total for not deleted
        .mockResolvedValueOnce(70); // with price for not deleted

      const testService = service as ReportsServiceForTesting;
      const result = await testService.calculateGroupStats(baseFilters, false);

      expect(result).toEqual({
        total: 80,
        withPrice: 70,
        withoutPrice: 10,
      });
    });

    it('should build group stats with correct percentage calculation', () => {
      const groupStats = { total: 25, withPrice: 20, withoutPrice: 5 };
      const totalProducts = 100;

      const testService = service as ReportsServiceForTesting;
      const result = testService.buildGroupStats(groupStats, totalProducts);

      expect(result).toEqual({
        percentage: 25,
        priceReport: {
          withPrice: 80,
          withoutPrice: 20,
        },
      });
    });

    it('should handle zero total products in percentage calculation', () => {
      const groupStats = { total: 0, withPrice: 0, withoutPrice: 0 };
      const totalProducts = 0;

      const testService = service as ReportsServiceForTesting;
      const result = testService.buildGroupStats(groupStats, totalProducts);

      expect(result).toEqual({
        percentage: 0,
        priceReport: {
          withPrice: 0,
          withoutPrice: 0,
        },
      });
    });

    it('should round values to two decimal places', () => {
      const testService = service as ReportsServiceForTesting;

      expect(testService.roundToTwoDecimals(33.333333)).toBe(33.33);
      expect(testService.roundToTwoDecimals(66.666666)).toBe(66.67);
      expect(testService.roundToTwoDecimals(100)).toBe(100);
      expect(testService.roundToTwoDecimals(0)).toBe(0);
    });
  });
});
