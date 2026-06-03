import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Inject,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateProductUseCase } from '../../application/use-cases/create-product.use-case';
import { ListProductsUseCase } from '../../application/use-cases/list-products.use-case';
import { UpdateProductUseCase } from '../../application/use-cases/update-product.use-case';
import { DeleteProductUseCase } from '../../application/use-cases/delete-product.use-case';
import { ProductRepository } from '../../domain/repositories/product.repository';
import { NotFoundException } from '@shared/domain/exceptions';
import { CreateProductDto } from '../dtos/create-product.dto';
import { UpdateProductDto } from '../dtos/update-product.dto';

@ApiTags('products')
@Controller('products')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class ProductController {
  constructor(
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly listProductsUseCase: ListProductsUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly deleteProductUseCase: DeleteProductUseCase,
    @Inject('ProductRepository')
    private readonly productRepository: ProductRepository,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async create(@Body() dto: CreateProductDto) {
    return this.createProductUseCase.execute({
      name: dto.name,
      description: dto.description,
      unitPrice: dto.unitPrice,
      category: dto.category,
    });
  }

  @Get()
  @ApiOperation({ summary: 'List all products' })
  @ApiResponse({ status: 200, description: 'Products listed successfully' })
  async findAll() {
    return this.listProductsUseCase.execute();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiResponse({ status: 200, description: 'Product found' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    const product = await this.productRepository.findById(id);

    if (!product) {
      throw new NotFoundException('Product not found', { productId: id });
    }

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      unitPrice: product.unitPrice,
      category: product.category,
      available: product.available,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a product' })
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateProductDto) {
    return this.updateProductUseCase.execute(id, {
      name: dto.name,
      description: dto.description,
      unitPrice: dto.unitPrice,
      category: dto.category,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a product' })
  @ApiResponse({ status: 204, description: 'Product deleted successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.deleteProductUseCase.execute(id);
  }
}
