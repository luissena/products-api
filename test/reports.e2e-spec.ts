import { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import * as dotenv from 'dotenv';
import request from 'supertest';
import { AppModule } from '../src/app.module';
dotenv.config();

describe('ReportsController (e2e)', () => {
  let app: NestExpressApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.set('query parser', 'extended');

    await app.init();
  });

  it('should return a report of products', async () => {
    // generate api key with ts-node scripts/generate-api-key.ts
    const apiKey = process.env.TEST_API_KEY;
    const response = await request(app.getHttpServer())
      .get('/reports/products')
      .set('Authorization', `Bearer ${apiKey}`)
      .expect(200);

    expect(response.body).toHaveProperty('deletedProducts');
    expect(response.body).toHaveProperty('notDeletedProducts');
    expect(response.body.deletedProducts).toHaveProperty('percentage');
    expect(response.body.notDeletedProducts).toHaveProperty('percentage');
    expect(response.body.deletedProducts).toHaveProperty('priceReport');
    expect(response.body.notDeletedProducts).toHaveProperty('priceReport');
    expect(response.body.deletedProducts.priceReport).toHaveProperty(
      'withPrice',
    );
    expect(response.body.deletedProducts.priceReport).toHaveProperty(
      'withoutPrice',
    );
    expect(response.body.notDeletedProducts.priceReport).toHaveProperty(
      'withPrice',
    );
    expect(response.body.notDeletedProducts.priceReport).toHaveProperty(
      'withoutPrice',
    );
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
    await app.close();
  });
});
