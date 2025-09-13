import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.set('query parser', 'extended');

  const config = new DocumentBuilder()
    .setTitle('Products API')
    .setDescription(
      'A comprehensive API for managing products with advanced filtering, pagination, and reporting capabilities. Features include product management, advanced filtering with nested query parameters, configurable pagination, sorting, product reports, Contentful integration, and JWT authentication. Filter format: /products?filters[brand][equal]=Apple&filters[price][gt]=100&pagination[skip]=0&pagination[limit]=10',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Products', 'Product management operations')
    .addTag('Reports', 'Product reporting and analytics')
    .addTag('Integrations', 'External service integrations')
    .addTag('Auth', 'Authentication operations')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/docs', app, documentFactory);

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
