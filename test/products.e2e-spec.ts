import { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('ProductsController (e2e)', () => {
  let app: NestExpressApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.set('query parser', 'extended');

    await app.init();
  });

  it('should return a list of products', async () => {
    await request(app.getHttpServer())
      .get('/products')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('pagination');
        expect(res.body).toHaveProperty('results');
        expect(res.body.pagination).toHaveProperty('total');
        expect(res.body.pagination).toHaveProperty('skip');
        expect(res.body.pagination).toHaveProperty('limit');
      });
  });

  it('should return a list of products with filters', async () => {
    const response = await request(app.getHttpServer())
      .get(
        '/products?filters[brand][equal]=Apple&pagination[skip]=0&pagination[limit]=2',
      )
      .expect(200);

    expect(response.body.results.length).toBeGreaterThan(0);
    expect(response.body.results[0].brand).toBe('Apple');
  });

  it('should return a list of products with pagination', async () => {
    const response = await request(app.getHttpServer())
      .get('/products?pagination[skip]=0&pagination[limit]=2')
      .expect(200);

    expect(response.body.pagination.skip).toBe(0);
    expect(response.body.pagination.limit).toBe(2);
    expect(response.body.results.length).toBeLessThanOrEqual(2);
  });

  it('should delete a product with valid id', async () => {
    const response = await request(app.getHttpServer())
      .delete('/products/bcf22a3f-301a-4113-bc77-a0d9a7779d25')
      .expect(200);

    expect(response.body.message).toBe('Product soft deleted successfully');
  });

  it('should return a 404 if the product is not found', async () => {
    await request(app.getHttpServer())
      .delete('/products/123e4567-e89b-12d3-a456-426614174000')
      .expect(404);
  });

  it('should return a 400 if the id is not a valid uuid', async () => {
    await request(app.getHttpServer())
      .delete('/products/123e4567-e89b-12d3-a456-426614174000')
      .expect(400);
  });

  afterAll(async () => {
    await app.close();
  });
});
