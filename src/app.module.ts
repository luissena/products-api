import KeyvRedis from '@keyv/redis';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { BullModule } from '@nestjs/bullmq';
import { CacheModule } from '@nestjs/cache-manager';
import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD, APP_PIPE } from '@nestjs/core';
import { seconds, ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentfulModule } from './integrations/contentful/contentful.module';
import { ProductsModule } from './products/products.module';
import { ReportsModule } from './reports/reports.module';
import { Product } from './typeorm/entities/product.entity';
import { SyncEntity } from './typeorm/entities/sync.entity';

/**
 * Root Application Module
 *
 * This is the main module that configures and imports all application modules.
 * It sets up database connections, queue management, configuration, and validation.
 * The module includes:
 * - Global configuration management
 * - PostgreSQL database connection with TypeORM
 * - Redis connection for BullMQ queues
 * - Product management module
 * - Contentful integration module
 * - Reports module
 * - Global validation pipe
 *
 * @class AppModule
 * @module AppModule
 */
@Module({
  imports: [
    // Global configuration module for environment variables
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        throttlers: [{ limit: 10, ttl: seconds(10) }],
        storage: new ThrottlerStorageRedisService(
          configService.get('REDIS_URL'),
        ),
      }),
      inject: [ConfigService],
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async (configService: ConfigService) => {
        return {
          stores: [new KeyvRedis(configService.get('REDIS_URL'))],
        };
      },
      inject: [ConfigService],
    }),
    // TypeORM configuration for PostgreSQL database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [Product, SyncEntity],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),

    // BullMQ configuration for Redis-based job queues
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
        },
      }),
      inject: [ConfigService],
    }),

    // Feature modules
    ProductsModule,
    ContentfulModule,
    ReportsModule,
  ],

  // Global providers
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    },
    {
      /**
       * This applies the rate-lite to all endpoints
       */
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
