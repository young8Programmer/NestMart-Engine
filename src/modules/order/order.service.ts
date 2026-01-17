import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Order } from '../../entities/order.entity';
import { OrderItem } from '../../entities/order-item.entity';
import { Product } from '../../entities/product.entity';
import { Store } from '../../entities/store.entity';
import { Address } from '../../entities/address.entity';
import { Payment } from '../../entities/payment.entity';
import { OrderStatus } from '../../common/enums/order-status.enum';
import { UserRole } from '../../common/enums/user-role.enum';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Store)
    private storeRepository: Repository<Store>,
    @InjectRepository(Address)
    private addressRepository: Repository<Address>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    private dataSource: DataSource,
  ) {}

  async create(userId: string, createOrderDto: CreateOrderDto): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Verify store exists and is active
      const store = await queryRunner.manager.findOne(Store, {
        where: { id: createOrderDto.storeId, isActive: true },
      });

      if (!store) {
        throw new NotFoundException('Store not found or inactive');
      }

      // Get shipping address if provided
      let shippingAddress: Address | null = null;
      if (createOrderDto.shippingAddressId) {
        shippingAddress = await queryRunner.manager.findOne(Address, {
          where: { id: createOrderDto.shippingAddressId, userId },
        });

        if (!shippingAddress) {
          throw new NotFoundException('Shipping address not found');
        }
      }

      // Calculate order totals and validate products
      let subtotal = 0;
      let totalDiscount = 0;
      const orderItems: OrderItem[] = [];

      for (const itemDto of createOrderDto.items) {
        const product = await queryRunner.manager.findOne(Product, {
          where: { id: itemDto.productId, storeId: store.id, isActive: true },
          lock: { mode: 'pessimistic_write' }, // Lock for ACID transaction
        });

        if (!product) {
          throw new NotFoundException(
            `Product ${itemDto.productId} not found or inactive`,
          );
        }

        if (product.stock < itemDto.quantity) {
          throw new BadRequestException(
            `Insufficient stock for product ${product.name}. Available: ${product.stock}`,
          );
        }

        // Calculate item total
        const itemPrice = product.discountPrice || product.price;
        const itemDiscount =
          product.discountPrice
            ? (product.price - product.discountPrice) * itemDto.quantity
            : 0;
        const itemTotal = itemPrice * itemDto.quantity;

        subtotal += itemTotal;
        totalDiscount += itemDiscount;

        // Create order item
        const orderItem = queryRunner.manager.create(OrderItem, {
          productId: product.id,
          product,
          quantity: itemDto.quantity,
          price: product.price,
          discount: itemDiscount,
          total: itemTotal,
        });

        orderItems.push(orderItem);

        // Decrease stock (ACID - will rollback if transaction fails)
        product.stock -= itemDto.quantity;
        product.sold += itemDto.quantity;
        await queryRunner.manager.save(product);
      }

      // Calculate commission (percentage of subtotal)
      const commission = (subtotal * store.commissionRate) / 100;
      const shippingCost = 10.0; // Fixed shipping cost (can be dynamic)
      const total = subtotal + shippingCost - totalDiscount;

      // Generate unique order number
      const orderNumber = `ORD-${Date.now()}-${uuidv4().substring(0, 8).toUpperCase()}`;

      // Create order
      const order = queryRunner.manager.create(Order, {
        orderNumber,
        customerId: userId,
        storeId: store.id,
        store,
        shippingAddressId: shippingAddress?.id,
        shippingAddress,
        status: OrderStatus.PENDING,
        subtotal,
        shippingCost,
        discount: totalDiscount,
        commission,
        total,
        notes: createOrderDto.notes,
        items: orderItems,
      });

      const savedOrder = await queryRunner.manager.save(order);

      // Update store statistics
      store.totalOrders += 1;
      await queryRunner.manager.save(store);

      // Commit transaction (ACID - all changes saved atomically)
      await queryRunner.commitTransaction();

      // Return order with relations
      return this.orderRepository.findOne({
        where: { id: savedOrder.id },
        relations: ['items', 'items.product', 'store', 'shippingAddress'],
      });
    } catch (error) {
      // Rollback transaction on error (ACID - revert all changes)
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }

  async findAll(userId: string, userRole: UserRole) {
    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .leftJoinAndSelect('order.store', 'store')
      .leftJoinAndSelect('order.shippingAddress', 'shippingAddress')
      .orderBy('order.createdAt', 'DESC');

    if (userRole === UserRole.CUSTOMER) {
      queryBuilder.where('order.customerId = :userId', { userId });
    } else if (userRole === UserRole.SELLER) {
      const store = await this.storeRepository.findOne({
        where: { userId },
      });
      if (store) {
        queryBuilder.where('order.storeId = :storeId', { storeId: store.id });
      } else {
        return { items: [], total: 0 };
      }
    }
    // Super Admin can see all orders

    const [items, total] = await queryBuilder.getManyAndCount();
    return { items, total };
  }

  async findOne(id: string, userId: string, userRole: UserRole): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: [
        'items',
        'items.product',
        'store',
        'customer',
        'shippingAddress',
        'payments',
      ],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Check access
    if (userRole === UserRole.CUSTOMER && order.customerId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    if (userRole === UserRole.SELLER) {
      const store = await this.storeRepository.findOne({
        where: { userId },
      });
      if (!store || order.storeId !== store.id) {
        throw new ForbiddenException('Access denied');
      }
    }

    return order;
  }

  async updateStatus(
    id: string,
    userId: string,
    userRole: UserRole,
    updateStatusDto: UpdateOrderStatusDto,
  ): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['store'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Only seller or admin can update order status
    if (userRole === UserRole.SELLER) {
      const store = await this.storeRepository.findOne({
        where: { userId },
      });
      if (!store || order.storeId !== store.id) {
        throw new ForbiddenException('Access denied');
      }
    } else if (userRole === UserRole.CUSTOMER) {
      throw new ForbiddenException('Customers cannot update order status');
    }

    order.status = updateStatusDto.status;
    return this.orderRepository.save(order);
  }

  async cancelOrder(id: string, userId: string): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = await queryRunner.manager.findOne(Order, {
        where: { id, customerId: userId },
        relations: ['items', 'items.product'],
      });

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      if (order.status === OrderStatus.DELIVERED || order.status === OrderStatus.CANCELLED) {
        throw new BadRequestException('Cannot cancel this order');
      }

      // Restore stock for all items (ACID - will rollback if fails)
      for (const item of order.items) {
        const product = await queryRunner.manager.findOne(Product, {
          where: { id: item.productId },
        });
        if (product) {
          product.stock += item.quantity;
          product.sold = Math.max(0, product.sold - item.quantity);
          await queryRunner.manager.save(product);
        }
      }

      // Update order status
      order.status = OrderStatus.CANCELLED;
      await queryRunner.manager.save(order);

      await queryRunner.commitTransaction();

      return this.orderRepository.findOne({
        where: { id },
        relations: ['items', 'items.product'],
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
