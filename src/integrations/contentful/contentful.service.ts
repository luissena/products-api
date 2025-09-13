import { HttpService } from '@nestjs/axios';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bullmq';
import { firstValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { ProductsService } from './../../products/products.service';
import { SyncEntity } from './../../typeorm/entities/sync.entity';
import { QUEUES } from './constants';
import { ContentfulSyncResponse, EntriesResponse } from './types';

@Injectable()
export class ContentfulService {
  constructor(
    @InjectQueue(QUEUES.importProduct) private importProductQueue: Queue,

    private readonly productsService: ProductsService,

    @InjectRepository(SyncEntity)
    private readonly syncRepository: Repository<SyncEntity>,

    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async getProducts() {
    const SPACE = this.configService.get<string>('CONTENTFUL_SPACE_ID');
    const ENVIRONMENT = this.configService.get<string>(
      'CONTENTFUL_ENVIRONMENT',
    );

    const access_token = this.configService.get<string>(
      'CONTENTFUL_ACCESS_TOKEN',
    );
    const content_type = this.configService.get<string>(
      'CONTENTFUL_CONTENT_TYPE',
    );

    const response = await firstValueFrom(
      this.httpService.get<EntriesResponse>(
        `/spaces/${SPACE}/environments/${ENVIRONMENT}/entries`,
        {
          params: {
            access_token,
            content_type,
          },
        },
      ),
    );

    return response.data;
  }

  async sync() {
    const syncToken = await this.syncRepository.findOne({
      where: {},
      order: {
        createdAt: 'ASC',
      },
    });

    if (!syncToken) {
      await this.initialSync();
      return;
    }

    await this.nextSync({
      token: syncToken.token,
    });
  }

  async initialSync() {
    const CONTENTFUL_SPACE_ID = this.configService.get<string>(
      'CONTENTFUL_SPACE_ID',
    );
    const access_token = this.configService.get<string>(
      'CONTENTFUL_ACCESS_TOKEN',
    );
    const content_type = this.configService.get<string>(
      'CONTENTFUL_CONTENT_TYPE',
    );

    await this.productsService.deleteAll();

    const { data } = await firstValueFrom(
      this.httpService.get<ContentfulSyncResponse>(
        `/spaces/${CONTENTFUL_SPACE_ID}/sync`,
        {
          params: {
            access_token,
            initial: true,
            content_type,
            type: 'Entry',
          },
        },
      ),
    );

    await this.importProductQueue.addBulk(
      data.items.map((product) => ({
        name: product.sys.id,
        data: product,
      })),
    );

    const { token } = await this.syncRepository.save({
      token: data.nextPageUrl as string,
    });

    await this.nextSync({
      token,
    });
  }

  async nextSync({ token }: { token: string }): Promise<void> {
    const access_token = this.configService.get<string>(
      'CONTENTFUL_ACCESS_TOKEN',
    );

    const { data } = await firstValueFrom(
      this.httpService.get<ContentfulSyncResponse>(token, {
        params: {
          access_token,
        },
      }),
    );

    await this.importProductQueue.addBulk(
      data.items.map((product) => ({
        name: product.sys.id,
        data: product,
      })),
    );

    if (token == data.nextSyncUrl) {
      return;
    }

    const { token: newToken } = await this.syncRepository.save({
      token: (data.nextSyncUrl || data.nextPageUrl) as string,
    });

    if (data.nextPageUrl) {
      await this.nextSync({
        token: newToken,
      });
    }
  }
}
