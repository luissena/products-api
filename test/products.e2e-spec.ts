import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import {
  DeleteProductResponse,
  ProductsListResponse,
  TestUtils,
} from './test-utils';

describe('ProductsController (e2e)', () => {
  let app: NestExpressApplication;

  beforeAll(async () => {
    app = await TestUtils.createTestApp();
  });

  it('should return a list of products', async () => {
    const response = await request(app.getHttpServer())
      .get('/products')
      .expect(200);

    const body = response.body as ProductsListResponse;
    expect(body).toHaveProperty('pagination');
    expect(body).toHaveProperty('results');
    expect(body.pagination).toHaveProperty('total');
    expect(body.pagination).toHaveProperty('skip');
    expect(body.pagination).toHaveProperty('limit');
  });

  it('should return a list of products with filters', async () => {
    const response = await request(app.getHttpServer())
      .get(
        '/products?filters[brand][equal]=Apple&pagination[skip]=0&pagination[limit]=2',
      )
      .expect(200);

    const body = response.body as ProductsListResponse;
    expect(body.results.length).toBeGreaterThan(0);
    expect(body.results[0].brand).toBe('Apple');
  });

  it('should return a list of products with pagination', async () => {
    const response = await request(app.getHttpServer())
      .get('/products?pagination[skip]=0&pagination[limit]=2')
      .expect(200);

    const body = response.body as ProductsListResponse;
    expect(body.pagination.skip).toBe(0);
    expect(body.pagination.limit).toBe(2);
    expect(body.results.length).toBeLessThanOrEqual(2);
  });

  it('should delete a product with valid id', async () => {
    // First, get a list of products to find an existing one
    const listResponse = await request(app.getHttpServer())
      .get('/products?pagination[limit]=1')
      .expect(200);

    const listBody = listResponse.body as ProductsListResponse;

    // Skip test if no products exist
    if (listBody.results.length === 0) {
      console.log('Skipping delete test: no products available');
      return;
    }

    const productId = listBody.results[0].id;

    const response = await request(app.getHttpServer())
      .delete(`/products/${productId}`)
      .expect(200);

    const body = response.body as DeleteProductResponse;
    expect(body.message).toBe('Product soft deleted successfully');
  });

  it('should return a 404 if the product is not found', async () => {
    await request(app.getHttpServer())
      .delete('/products/123e4567-e89b-12d3-a456-426614174000')
      .expect(404);
  });

  it('should return a 400 if the id is not a valid uuid', async () => {
    await request(app.getHttpServer())
      .delete('/products/invalid-uuid')
      .expect(400);
  });

  afterAll(async () => {
    await TestUtils.closeTestApp(app);
  });
});
