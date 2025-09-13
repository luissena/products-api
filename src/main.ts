import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

/**
 * Bootstrap function to initialize and start the NestJS application
 *
 * This function creates the NestJS application instance, configures Swagger documentation,
 * and starts the server on the specified port. It sets up comprehensive API documentation
 * with authentication support and organized endpoint tags.
 *
 * @async
 * @function bootstrap
 * @returns {Promise<void>} Resolves when the application is successfully started
 *
 * @example
 * ```typescript
 * // Application will start on port 3001 by default
 * // Swagger documentation available at /api/docs
 * bootstrap();
 * ```
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Configure extended query parser for nested query parameters
  app.set('query parser', 'extended');

  // Configure Swagger documentation
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

  // Create Swagger document factory function
  const documentFactory = () => SwaggerModule.createDocument(app, config);

  // Setup Swagger UI at /api/docs
  SwaggerModule.setup('api/docs', app, documentFactory);

  // Start the application server
  await app.listen(process.env.PORT ?? 3001);
}

// Start the application
void bootstrap();
