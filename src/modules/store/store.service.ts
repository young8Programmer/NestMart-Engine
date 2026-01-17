import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Store } from '../../entities/store.entity';
import { User } from '../../entities/user.entity';
import { UserRole } from '../../common/enums/user-role.enum';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';

@Injectable()
export class StoreService {
  constructor(
    @InjectRepository(Store)
    private storeRepository: Repository<Store>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private dataSource: DataSource,
  ) {}

  async create(userId: string, createStoreDto: CreateStoreDto): Promise<Store> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['store'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.store) {
      throw new BadRequestException('User already has a store');
    }

    // Check if slug already exists
    const existingStore = await this.storeRepository.findOne({
      where: { slug: createStoreDto.slug },
    });

    if (existingStore) {
      throw new BadRequestException('Store slug already exists');
    }

    const store = this.storeRepository.create({
      ...createStoreDto,
      userId,
      user,
      isActive: false, // New stores need admin approval
      commissionRate: 5.0, // Default commission rate (can be changed by Super Admin)
    });

    return this.storeRepository.save(store);
  }

  async findAll(): Promise<Store[]> {
    return this.storeRepository.find({
      where: { isActive: true },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Store> {
    const store = await this.storeRepository.findOne({
      where: { id },
      relations: ['user', 'products'],
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    return store;
  }

  async findBySlug(slug: string): Promise<Store> {
    const store = await this.storeRepository.findOne({
      where: { slug, isActive: true },
      relations: ['user', 'products'],
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    return store;
  }

  async findMyStore(userId: string): Promise<Store> {
    const store = await this.storeRepository.findOne({
      where: { userId },
      relations: ['user', 'products'],
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    return store;
  }

  async update(
    id: string,
    userId: string,
    updateStoreDto: UpdateStoreDto,
    userRole: UserRole,
  ): Promise<Store> {
    const store = await this.storeRepository.findOne({
      where: { id },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    // Only store owner or Super Admin can update
    if (store.userId !== userId && userRole !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('You are not authorized to update this store');
    }

    // Check slug uniqueness if updating slug
    if (updateStoreDto.slug && updateStoreDto.slug !== store.slug) {
      const existingStore = await this.storeRepository.findOne({
        where: { slug: updateStoreDto.slug },
      });

      if (existingStore) {
        throw new BadRequestException('Store slug already exists');
      }
    }

    Object.assign(store, updateStoreDto);
    return this.storeRepository.save(store);
  }

  async remove(id: string, userId: string, userRole: UserRole): Promise<void> {
    const store = await this.storeRepository.findOne({
      where: { id },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    // Only store owner or Super Admin can delete
    if (store.userId !== userId && userRole !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('You are not authorized to delete this store');
    }

    await this.storeRepository.softRemove(store);
  }

  // Admin only: Approve/Reject stores
  async approveStore(id: string): Promise<Store> {
    const store = await this.storeRepository.findOne({ where: { id } });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    store.isActive = true;
    store.isVerified = true;

    return this.storeRepository.save(store);
  }

  async setCommissionRate(
    id: string,
    commissionRate: number,
  ): Promise<Store> {
    const store = await this.storeRepository.findOne({ where: { id } });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    store.commissionRate = commissionRate;
    return this.storeRepository.save(store);
  }
}
