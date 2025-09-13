import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

/**
 * Database index name for the unique constraint on integration and externalId
 *
 * @constant {string} PRODUCT_INTEGRATION_EXTERNAL_ID_IDX
 */
const PRODUCT_INTEGRATION_EXTERNAL_ID_IDX =
  'idx_products_integration_external_id';

/**
 * Product Entity
 *
 * Represents a product in the database with comprehensive information including
 * basic product details, pricing, inventory, and integration metadata.
 * Includes soft delete functionality and unique constraint on integration + externalId.
 *
 * @class Product
 * @entity Product
 */
@Unique(PRODUCT_INTEGRATION_EXTERNAL_ID_IDX, ['externalId', 'integration'])
@Entity()
export class Product {
  /**
   * Unique identifier for the product (UUID)
   *
   * @property {string} id - Primary key, auto-generated UUID
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Stock Keeping Unit identifier
   *
   * @property {string} sku - Unique product identifier, max 50 characters
   */
  @Column({ type: 'varchar', length: 50 })
  sku: string;

  /**
   * Product name
   *
   * @property {string} name - Full product name, max 255 characters
   */
  @Column({ type: 'varchar', length: 255 })
  name: string;

  /**
   * Product brand
   *
   * @property {string} brand - Brand name, max 100 characters
   */
  @Column({ type: 'varchar', length: 100 })
  brand: string;

  /**
   * Product model
   *
   * @property {string} model - Model name or number, max 100 characters
   */
  @Column({ type: 'varchar', length: 100 })
  model: string;

  /**
   * Product category (optional)
   *
   * @property {string} [category] - Category classification, max 100 characters
   */
  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string;

  /**
   * Product color (optional)
   *
   * @property {string} [color] - Color description, max 50 characters
   */
  @Column({ type: 'varchar', length: 50, nullable: true })
  color: string;

  /**
   * Product price (optional)
   *
   * @property {number} [price] - Price with 2 decimal places precision
   */
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price: number;

  /**
   * Currency code (optional)
   *
   * @property {string} [currency] - ISO 4217 currency code, max 3 characters
   */
  @Column({ type: 'varchar', length: 3, nullable: true })
  currency: string;

  /**
   * Stock quantity (optional)
   *
   * @property {number} [stock] - Available inventory quantity
   */
  @Column({ type: 'int', nullable: true })
  stock: number;

  /**
   * External system identifier (optional)
   *
   * @property {string} [externalId] - ID from external system (e.g., Contentful), max 36 characters
   */
  @Column({ type: 'varchar', length: 36, nullable: true })
  externalId: string;

  /**
   * Integration source (optional)
   *
   * @property {string} [integration] - Source system name (e.g., 'contentful'), max 100 characters
   */
  @Column({ type: 'varchar', length: 100, nullable: true })
  integration: string;

  /**
   * Creation timestamp
   *
   * @property {Date} createdAt - When the product was created (timezone-aware)
   */
  @Column({ type: 'timestamptz' })
  createdAt: Date;

  /**
   * Last update timestamp
   *
   * @property {Date} updatedAt - When the product was last modified (timezone-aware)
   */
  @Column({ type: 'timestamptz' })
  updatedAt: Date;

  /**
   * Soft delete timestamp (optional)
   *
   * @property {Date | null} [deletedAt] - When the product was soft deleted, null if active
   */
  @Column({ type: 'timestamptz', nullable: true })
  deletedAt?: Date | null;
}
