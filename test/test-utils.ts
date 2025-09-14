import { JwtService } from '@nestjs/jwt';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';

/**
 * Test utilities for E2E tests
 */
export class TestUtils {
  /**
   * Creates a NestJS application for E2E testing
   */
  static async createTestApp(): Promise<NestExpressApplication> {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const app = moduleRef.createNestApplication<NestExpressApplication>();
    app.set('query parser', 'extended');

    await app.init();
    return app;
  }

  /**
   * Closes the test application and cleans up resources
   */
  static async closeTestApp(app: NestExpressApplication): Promise<void> {
    await app.close();
  }
}

/**
 * Response interfaces for type-safe testing
 */
export interface ProductsListResponse {
  pagination: {
    total: number;
    skip: number;
    limit: number;
  };
  results: Array<{
    id: string;
    brand: string;
    name: string;
    sku: string;
    price?: number;
    currency?: string;
  }>;
}

export interface DeleteProductResponse {
  message: string;
}

export interface ReportsResponse {
  deletedProducts: {
    percentage: number;
    priceReport: {
      withPrice: number;
      withoutPrice: number;
    };
  };
  notDeletedProducts: {
    percentage: number;
    priceReport: {
      withPrice: number;
      withoutPrice: number;
    };
  };
}

/**
 * Test data factories
 */
export class TestDataFactory {
  static createProduct(overrides: Partial<any> = {}) {
    return {
      id: 'test-id-123',
      name: 'Test Product',
      sku: 'TEST-SKU-001',
      brand: 'Test Brand',
      model: 'Test Model',
      category: 'Test Category',
      color: 'Test Color',
      price: 99.99,
      currency: 'USD',
      stock: 10,
      externalId: 'ext-test-123',
      integration: 'contentful',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      ...overrides,
    };
  }

  static createUpsertProduct(overrides: Partial<any> = {}) {
    return {
      sku: 'TEST-SKU-001',
      name: 'Test Product',
      brand: 'Test Brand',
      model: 'Test Model',
      category: 'Test Category',
      color: 'Test Color',
      price: 99.99,
      currency: 'USD',
      stock: 10,
      externalId: 'ext-test-123',
      integration: 'contentful',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }
}

/**
 * Mock factories for consistent test doubles
 */
export class MockFactory {
  static createRepositoryMock() {
    return {
      findAndCount: jest.fn(),
      upsert: jest.fn(),
      deleteAll: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    };
  }

  static createCacheManagerMock() {
    return {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      reset: jest.fn(),
      clear: jest.fn(),
    };
  }

  static createJwtServiceMock(): jest.Mocked<
    Pick<JwtService, 'sign' | 'verify'>
  > {
    return {
      sign: jest.fn(),
      verify: jest.fn(),
    };
  }
}
