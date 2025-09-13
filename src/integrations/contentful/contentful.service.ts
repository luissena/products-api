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

/**
 * Contentful Integration Service
 *
 * This service handles integration with Contentful CMS for product synchronization.
 * It provides methods to fetch products from Contentful, perform initial sync,
 * and handle incremental synchronization using Contentful's sync API.
 *
 * @class ContentfulService
 */
@Injectable()
export class ContentfulService {
  /**
   * Creates an instance of ContentfulService
   *
   * @param {Queue} importProductQueue - BullMQ queue for importing products
   * @param {ProductsService} productsService - Service for product operations
   * @param {Repository<SyncEntity>} syncRepository - Repository for sync token storage
   * @param {HttpService} httpService - HTTP client for Contentful API calls
   * @param {ConfigService} configService - Configuration service for environment variables
   */
  constructor(
    @InjectQueue(QUEUES.importProduct) private importProductQueue: Queue,

    private readonly productsService: ProductsService,

    @InjectRepository(SyncEntity)
    private readonly syncRepository: Repository<SyncEntity>,

    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Fetches all products from Contentful using the entries API
   *
   * This method retrieves all product entries from Contentful based on the configured
   * content type. It uses the standard Contentful entries API endpoint.
   *
   * @returns {Promise<EntriesResponse>} Response containing all product entries from Contentful
   *
   * @example
   * ```typescript
   * const entries = await contentfulService.getProducts();
   * console.log(`Found ${entries.items.length} products`);
   * ```
   */
  async getProducts(): Promise<EntriesResponse> {
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

  /**
   * Performs product synchronization with Contentful
   *
   * This method determines whether to perform an initial sync or incremental sync
   * based on the presence of existing sync tokens. If no sync token exists,
   * it performs an initial sync. Otherwise, it continues with incremental sync.
   *
   * @returns {Promise<void>} Resolves when synchronization is complete
   *
   * @example
   * ```typescript
   * await contentfulService.sync();
   * console.log('Synchronization completed');
   * ```
   */
  async sync(): Promise<void> {
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

  /**
   * Performs initial synchronization with Contentful
   *
   * This method performs a full synchronization by:
   * 1. Clearing all existing products from the database
   * 2. Fetching all products from Contentful using the sync API
   * 3. Adding all products to the import queue for processing
   * 4. Storing the sync token for future incremental syncs
   * 5. Continuing with paginated sync if needed
   *
   * @returns {Promise<void>} Resolves when initial sync is complete
   *
   * @example
   * ```typescript
   * await contentfulService.initialSync();
   * console.log('Initial synchronization completed');
   * ```
   */
  async initialSync(): Promise<void> {
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

  /**
   * Performs incremental synchronization using a sync token
   *
   * This method continues synchronization from a previous state using Contentful's
   * sync API. It processes incremental changes and handles pagination automatically.
   *
   * @param {Object} params - Sync parameters
   * @param {string} params.token - Contentful sync token for incremental sync
   * @returns {Promise<void>} Resolves when incremental sync is complete
   *
   * @example
   * ```typescript
   * await contentfulService.nextSync({ token: 'sync-token-123' });
   * console.log('Incremental sync completed');
   * ```
   */
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
