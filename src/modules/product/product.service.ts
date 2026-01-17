import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, MoreThanOrEqual } from 'typeorm';
import { Product } from '../../entities/product.entity';
import { Store } from '../../entities/store.entity';
import { UserRole } from '../../common/enums/user-role.enum';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Store)
    private storeRepository: Repository<Store>,
  ) {}

  async create(
    storeId: string,
    userId: string,
    createProductDto: CreateProductDto,
  ): Promise<Product> {
    // Verify store ownership
    const store = await this.storeRepository.findOne({
      where: { id: storeId, userId },
    });

    if (!store) {
      throw new ForbiddenException('Store not found or access denied');
    }

    if (!store.isActive) {
      throw new ForbiddenException('Store is not active');
    }

    const product = this.productRepository.create({
      ...createProductDto,
      storeId,
      store,
      images: createProductDto.images || [],
      tags: createProductDto.tags || [],
    });

    const savedProduct = await this.productRepository.save(product);

    // Update store product count
    store.totalProducts = (store.totalProducts || 0) + 1;
    await this.storeRepository.save(store);

    return savedProduct;
  }

  async findAll(filterDto: FilterProductDto) {
    const {
      search,
      categoryId,
      storeId,
      brand,
      minPrice,
      maxPrice,
      minRating,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      page = 1,
      limit = 20,
    } = filterDto;

    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.store', 'store')
      .leftJoinAndSelect('product.category', 'category')
      .where('product.isActive = :isActive', { isActive: true })
      .andWhere('product.deletedAt IS NULL');

    if (search) {
      queryBuilder.andWhere(
        '(product.name ILIKE :search OR product.description ILIKE :search OR product.brand ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (categoryId) {
      queryBuilder.andWhere('product.categoryId = :categoryId', { categoryId });
    }

    if (storeId) {
      queryBuilder.andWhere('product.storeId = :storeId', { storeId });
    }

    if (brand) {
      queryBuilder.andWhere('product.brand = :brand', { brand });
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      if (minPrice !== undefined && maxPrice !== undefined) {
        queryBuilder.andWhere('product.price BETWEEN :minPrice AND :maxPrice', {
          minPrice,
          maxPrice,
        });
      } else if (minPrice !== undefined) {
        queryBuilder.andWhere('product.price >= :minPrice', { minPrice });
      } else if (maxPrice !== undefined) {
        queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice });
      }
    }

    if (minRating !== undefined) {
      queryBuilder.andWhere('product.rating >= :minRating', { minRating });
    }

    queryBuilder.orderBy(`product.${sortBy}`, sortOrder);

    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['store', 'category', 'reviews'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async findByStore(
    storeId: string,
    userId: string,
    userRole: UserRole,
  ): Promise<Product[]> {
    // Verify store ownership or admin
    const store = await this.storeRepository.findOne({
      where: { id: storeId },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    if (store.userId !== userId && userRole !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Access denied');
    }

    return this.productRepository.find({
      where: { storeId },
      relations: ['category'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(
    id: string,
    storeId: string,
    userId: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id, storeId },
      relations: ['store'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Verify store ownership
    if (product.store.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    Object.assign(product, updateProductDto);
    return this.productRepository.save(product);
  }

  async remove(id: string, storeId: string, userId: string): Promise<void> {
    const product = await this.productRepository.findOne({
      where: { id, storeId },
      relations: ['store'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Verify store ownership
    if (product.store.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    // Soft delete
    await this.productRepository.softRemove(product);

    // Update store product count
    const store = product.store;
    store.totalProducts = Math.max(0, (store.totalProducts || 0) - 1);
    await this.storeRepository.save(store);
  }

  async updateStock(id: string, quantity: number): Promise<Product> {
    const product = await this.findOne(id);

    product.stock = Math.max(0, product.stock + quantity);

    return this.productRepository.save(product);
  }
}
