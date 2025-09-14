import { NestExpressApplication } from '@nestjs/platform-express';
import * as dotenv from 'dotenv';
import request from 'supertest';
import { ReportsResponse, TestUtils } from './test-utils';
dotenv.config();

describe('ReportsController (e2e)', () => {
  let app: NestExpressApplication;

  beforeAll(async () => {
    app = await TestUtils.createTestApp();
  });

  it('should return a report of products', async () => {
    // generate api key with ts-node scripts/generate-api-key.ts
    const apiKey = process.env.TEST_API_KEY;
    const response = await request(app.getHttpServer())
      .get('/reports/products')
      .set('Authorization', `Bearer ${apiKey}`)
      .expect(200);

    const body = response.body as ReportsResponse;
    expect(body).toHaveProperty('deletedProducts');
    expect(body).toHaveProperty('notDeletedProducts');
    expect(body.deletedProducts).toHaveProperty('percentage');
    expect(body.notDeletedProducts).toHaveProperty('percentage');
    expect(body.deletedProducts).toHaveProperty('priceReport');
    expect(body.notDeletedProducts).toHaveProperty('priceReport');
    expect(body.deletedProducts.priceReport).toHaveProperty('withPrice');
    expect(body.deletedProducts.priceReport).toHaveProperty('withoutPrice');
    expect(body.notDeletedProducts.priceReport).toHaveProperty('withPrice');
    expect(body.notDeletedProducts.priceReport).toHaveProperty('withoutPrice');
  });

  //   unauthenticated
  it('should return a 401 if the api key is not provided', async () => {
    await request(app.getHttpServer()).get('/reports/products').expect(401);
  });

  it('should return a 401 if the api key is invalid', async () => {
    await request(app.getHttpServer())
      .get('/reports/products')
      .set('Authorization', `Bearer invalid`)
      .expect(401);
  });

  afterAll(async () => {
    await TestUtils.closeTestApp(app);
  });
});
