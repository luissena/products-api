import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';
const PRODUCT_INTEGRATION_EXTERNAL_ID_IDX =
  'idx_products_integration_external_id';
@Unique(PRODUCT_INTEGRATION_EXTERNAL_ID_IDX, ['externalId', 'integration'])
@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  sku: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100 })
  brand: string;

  @Column({ type: 'varchar', length: 100 })
  model: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  color: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price: number;

  @Column({ type: 'varchar', length: 3, nullable: true })
  currency: string;

  @Column({ type: 'int', nullable: true })
  stock: number;

  @Column({ type: 'varchar', length: 36, nullable: true })
  externalId: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  integration: string;

  @Column({ type: 'timestamptz' })
  createdAt: Date;

  @Column({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  deletedAt?: Date | null;
}
