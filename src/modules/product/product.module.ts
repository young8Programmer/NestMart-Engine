import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { Product } from '../../entities/product.entity';
import { Store } from '../../entities/store.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Store])],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
