import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Equal, IsNull } from 'typeorm';
import { MockFactory, TestDataFactory } from '../../test/test-utils';
import { Product } from '../typeorm/entities/product.entity';
import {
  LIST_PRODUCTS_DEFAULT_LIMIT,
  LIST_PRODUCTS_DEFAULT_SKIP,
} from './constants';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  let service: ProductsService;
  let mockRepository: ReturnType<typeof MockFactory.createRepositoryMock>;
  let mockCacheManager: ReturnType<typeof MockFactory.createCacheManagerMock>;

  beforeAll(() => {
    mockRepository = MockFactory.createRepositoryMock();
    mockCacheManager = MockFactory.createCacheManagerMock();
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockRepository,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('list', () => {
    it('should return products with default pagination when no pagination is provided', async () => {
      // Arrange
      const mockProducts = [
        TestDataFactory.createProduct({
          id: '1',
          name: 'Product 1',
          sku: 'SKU1',
        }),
        TestDataFactory.createProduct({
          id: '2',
          name: 'Product 2',
          sku: 'SKU2',
        }),
      ] as Product[];
      mockRepository.findAndCount.mockResolvedValue([mockProducts, 2]);

      // Act
      const result = await service.list({});

      // Assert
      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: {
          deletedAt: IsNull(),
        },
        skip: LIST_PRODUCTS_DEFAULT_SKIP,
        take: LIST_PRODUCTS_DEFAULT_LIMIT,
        order: undefined,
      });

      expect(result).toEqual({
        results: mockProducts,
        pagination: {
          total: 2,
          skip: LIST_PRODUCTS_DEFAULT_SKIP,
          limit: LIST_PRODUCTS_DEFAULT_LIMIT,
        },
      });
    });

    it('should return products with custom pagination', async () => {
      // Arrange
      const mockProducts = [
        TestDataFactory.createProduct({
          id: '1',
          name: 'Product 1',
          sku: 'SKU1',
        }),
      ] as Product[];
      const pagination = { skip: 10, limit: 20 };
      mockRepository.findAndCount.mockResolvedValue([mockProducts, 1]);

      // Act
      const result = await service.list({ pagination });

      // Assert
      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: {
          deletedAt: IsNull(),
        },
        skip: 10,
        take: 20,
        order: undefined,
      });

      expect(result.pagination).toEqual({
        total: 1,
        skip: 10,
        limit: 20,
      });
    });

    it('should return products with filters and order', async () => {
      // Arrange
      const mockProducts = [
        TestDataFactory.createProduct({
          id: '1',
          name: 'Product 1',
          sku: 'SKU1',
          brand: 'Apple',
        }),
      ] as Product[];
      const filters = { brand: { equal: 'Apple' } };
      const order = { name: 'ASC' as const };
      mockRepository.findAndCount.mockResolvedValue([mockProducts, 1]);

      // Act
      const result = await service.list({ filters, order });

      // Assert
      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: {
          brand: Equal('Apple'),
          deletedAt: IsNull(),
        },
        skip: LIST_PRODUCTS_DEFAULT_SKIP,
        take: LIST_PRODUCTS_DEFAULT_LIMIT,
        order: { name: 'ASC' },
      });

      expect(result.results).toEqual(mockProducts);
    });
  });

  describe('upsert', () => {
    it('should upsert a product and clear cache', async () => {
      // Arrange
      const product = TestDataFactory.createUpsertProduct();
      mockRepository.upsert.mockResolvedValue(undefined);
      mockCacheManager.clear.mockResolvedValue(undefined);

      // Act
      await service.upsert(product);

      // Assert
      expect(mockRepository.upsert).toHaveBeenCalledWith(product, {
        conflictPaths: ['integration', 'externalId'],
      });
      expect(mockCacheManager.clear).toHaveBeenCalled();
    });

    it('should handle upsert errors gracefully', async () => {
      // Arrange
      const product = TestDataFactory.createUpsertProduct();
      const error = new Error('Database connection failed');
      mockRepository.upsert.mockRejectedValue(error);

      // Act & Assert
      await expect(service.upsert(product)).rejects.toThrow(
        'Database connection failed',
      );
      expect(mockCacheManager.clear).not.toHaveBeenCalled();
    });
  });

  describe('deleteAll', () => {
    it('should delete all products and clear cache', async () => {
      // Arrange
      mockRepository.deleteAll.mockResolvedValue(undefined);
      mockCacheManager.clear.mockResolvedValue(undefined);

      // Act
      await service.deleteAll();

      // Assert
      expect(mockRepository.deleteAll).toHaveBeenCalled();
      expect(mockCacheManager.clear).toHaveBeenCalled();
    });
  });

  describe('softDelete', () => {
    it('should soft delete a product by id and clear cache', async () => {
      // Arrange
      const productId = 'product-id-123';
      const mockUpdateResult = { affected: 1 };
      mockRepository.update.mockResolvedValue(mockUpdateResult);
      mockCacheManager.clear.mockResolvedValue(undefined);

      // Act
      const result = await service.softDelete(productId);

      // Assert
      expect(mockRepository.update).toHaveBeenCalledWith(
        { id: productId },
        { deletedAt: expect.any(Date) },
      );
      expect(mockCacheManager.clear).toHaveBeenCalled();
      expect(result).toBe(1);
    });

    it('should return 0 when no product is affected by soft delete', async () => {
      // Arrange
      const productId = 'non-existent-id';
      const mockUpdateResult = { affected: 0 };
      mockRepository.update.mockResolvedValue(mockUpdateResult);
      mockCacheManager.clear.mockResolvedValue(undefined);

      // Act
      const result = await service.softDelete(productId);

      // Assert
      expect(result).toBe(0);
      expect(mockCacheManager.clear).toHaveBeenCalled();
    });

    it('should handle soft delete errors gracefully', async () => {
      // Arrange
      const productId = 'product-id-123';
      const error = new Error('Database error');
      mockRepository.update.mockRejectedValue(error);

      // Act & Assert
      await expect(service.softDelete(productId)).rejects.toThrow(
        'Database error',
      );
      expect(mockCacheManager.clear).not.toHaveBeenCalled();
    });
  });
});
