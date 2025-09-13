import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { QUEUES } from '../constants';
import { ContentfulService } from '../contentful.service';

@Processor(QUEUES.syncProducts)
export class SyncProductsQueue extends WorkerHost {
  constructor(
    @InjectQueue(QUEUES.syncProducts) private syncProductsQueue: Queue,
    private readonly contentfulService: ContentfulService,
  ) {
    super();
  }

  async onModuleInit() {
    await this.syncProductsQueue.upsertJobScheduler(QUEUES.syncProducts, {
      every: 1000 * 60 * 60,
    });
  }

  async process(): Promise<any> {
    await this.contentfulService.sync();
  }
}
