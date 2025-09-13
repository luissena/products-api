import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from 'src/products/products.module';
import { SyncEntity } from 'src/typeorm/entities/sync.entity';
import { QUEUES } from './constants';
import { ContentfulService } from './contentful.service';
import { ImportProductQueue } from './queues/import-product.queue';
import { SyncProductsQueue } from './queues/sync-products';
@Module({
  imports: [
    ProductsModule,
    TypeOrmModule.forFeature([SyncEntity]),
    BullModule.registerQueue({
      name: QUEUES.syncProducts,
    }),
    BullModule.registerQueue({
      name: QUEUES.importProduct,
    }),
    HttpModule.register({
      baseURL: 'https://cdn.contentful.com',
    }),
  ],
  providers: [ContentfulService, SyncProductsQueue, ImportProductQueue],
  exports: [ContentfulService],
  controllers: [],
})
export class ContentfulModule {}
