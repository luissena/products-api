import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { QUEUES } from '../constants';
import { ProductItem } from '../types';
import { ProductsService } from './../../../products/products.service';
import { productMapper } from './../../../typeorm/mappers';

@Processor(QUEUES.importProduct)
export class ImportProductQueue extends WorkerHost {
  constructor(private readonly productsService: ProductsService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const product = productMapper(job.data as ProductItem);

    await job.updateProgress(50);

    const result = await this.productsService.upsert(product);

    await job.updateProgress(100);

    return result;
  }
}
