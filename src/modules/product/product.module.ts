import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductAggregate } from './domain/aggregates/product.aggregate';
import { TypeOrmProductRepository } from './infrastructure/persistence/typeorm-product.repository';
import { CreateProductUseCase } from './application/use-cases/create-product.use-case';
import { ListProductsUseCase } from './application/use-cases/list-products.use-case';
import { UpdateProductUseCase } from './application/use-cases/update-product.use-case';
import { DeleteProductUseCase } from './application/use-cases/delete-product.use-case';
import { ProductController } from './interface/controllers/product.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ProductAggregate])],
  controllers: [ProductController],
  providers: [
    {
      provide: 'ProductRepository',
      useClass: TypeOrmProductRepository,
    },
    CreateProductUseCase,
    ListProductsUseCase,
    UpdateProductUseCase,
    DeleteProductUseCase,
  ],
  exports: ['ProductRepository'],
})
export class ProductModule {}
