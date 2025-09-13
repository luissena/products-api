import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Equal, IsNull, Repository } from 'typeorm';
import { Product } from '../typeorm/entities/product.entity';
import { UpsertProduct } from '../typeorm/types';
import {
  LIST_PRODUCTS_DEFAULT_LIMIT,
  LIST_PRODUCTS_DEFAULT_SKIP,
} from './constants';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  let service: ProductsService;
  let repository: Repository<Product>;

  const mockRepository = {
    findAndCount: jest.fn(),
    upsert: jest.fn(),
    deleteAll: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    repository = module.get<Repository<Product>>(getRepositoryToken(Product));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('list', () => {
    it('should return products with default pagination when no pagination is provided', async () => {
      const mockProducts = [
        { id: '1', name: 'Product 1', sku: 'SKU1' },
        { id: '2', name: 'Product 2', sku: 'SKU2' },
      ] as Product[];

      mockRepository.findAndCount.mockResolvedValue([mockProducts, 2]);

      const result = await service.list({});

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
      const mockProducts = [
        { id: '1', name: 'Product 1', sku: 'SKU1' },
      ] as Product[];
      const pagination = { skip: 10, limit: 20 };

      mockRepository.findAndCount.mockResolvedValue([mockProducts, 1]);

      const result = await service.list({ pagination });

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
      const mockProducts = [
        { id: '1', name: 'Product 1', sku: 'SKU1' },
      ] as Product[];
      const filters = { brand: { equal: 'Apple' } };
      const order = { name: 'ASC' as const };

      mockRepository.findAndCount.mockResolvedValue([mockProducts, 1]);

      const result = await service.list({ filters, order });

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
    it('should upsert a product', async () => {
      const product: UpsertProduct = {
        sku: 'SKU1',
        name: 'Product 1',
        brand: 'Apple',
        model: 'iPhone',
        category: 'Phone',
        color: 'Black',
        price: 999,
        currency: 'USD',
        stock: 10,
        externalId: 'ext1',
        integration: 'contentful',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.upsert.mockResolvedValue(undefined);

      await service.upsert(product);

      expect(mockRepository.upsert).toHaveBeenCalledWith(product, {
        conflictPaths: ['integration', 'externalId'],
      });
    });
  });

  describe('deleteAll', () => {
    it('should delete all products', async () => {
      mockRepository.deleteAll.mockResolvedValue(undefined);

      await service.deleteAll();

      expect(mockRepository.deleteAll).toHaveBeenCalled();
    });
  });

  describe('softDelete', () => {
    it('should soft delete a product by id', async () => {
      const productId = 'product-id-123';
      const mockUpdateResult = { affected: 1 };

      mockRepository.update.mockResolvedValue(mockUpdateResult);

      const result = await service.softDelete(productId);

      expect(mockRepository.update).toHaveBeenCalledWith(
        { id: productId },
        { deletedAt: expect.any(Date) },
      );
      expect(result).toBe(1);
    });

    it('should return 0 when no product is affected by soft delete', async () => {
      const productId = 'non-existent-id';
      const mockUpdateResult = { affected: 0 };

      mockRepository.update.mockResolvedValue(mockUpdateResult);

      const result = await service.softDelete(productId);

      expect(result).toBe(0);
    });
  });
});
