import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from 'src/products/products.module';
import { Product } from 'src/typeorm/entities/product.entity';
import { AuthModule } from '../auth/auth.module';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  imports: [ProductsModule, TypeOrmModule.forFeature([Product]), AuthModule],
  providers: [ReportsService],
  controllers: [ReportsController],
})
export class ReportsModule {}
