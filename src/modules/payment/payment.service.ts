import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Payment } from '../../entities/payment.entity';
import { Order } from '../../entities/order.entity';
import { PaymentStatus } from '../../common/enums/payment-status.enum';
import { PaymentMethod } from '../../common/enums/payment-method.enum';
import { OrderStatus } from '../../common/enums/order-status.enum';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    private dataSource: DataSource,
  ) {}

  async create(userId: string, createPaymentDto: CreatePaymentDto): Promise<Payment> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Verify order exists and belongs to user
      const order = await queryRunner.manager.findOne(Order, {
        where: { id: createPaymentDto.orderId, customerId: userId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      if (order.status === OrderStatus.CANCELLED) {
        throw new BadRequestException('Cannot pay for cancelled order');
      }

      // Check if order is already paid
      const existingPayment = await queryRunner.manager.findOne(Payment, {
        where: {
          orderId: createPaymentDto.orderId,
          status: PaymentStatus.COMPLETED,
        },
      });

      if (existingPayment) {
        throw new BadRequestException('Order is already paid');
      }

      // Validate payment amount matches order total
      if (Math.abs(createPaymentDto.amount - order.total) > 0.01) {
        throw new BadRequestException('Payment amount does not match order total');
      }

      // Simulate payment processing
      const paymentResult = await this.processPayment(
        createPaymentDto.method,
        createPaymentDto.amount,
      );

      const transactionId = `TXN-${Date.now()}-${uuidv4().substring(0, 8).toUpperCase()}`;

      // Create payment record
      const payment = queryRunner.manager.create(Payment, {
        transactionId,
        orderId: createPaymentDto.orderId,
        order,
        method: createPaymentDto.method,
        amount: createPaymentDto.amount,
        status: paymentResult.success
          ? PaymentStatus.COMPLETED
          : PaymentStatus.FAILED,
        metadata: paymentResult.metadata || {},
        notes: createPaymentDto.notes,
      });

      const savedPayment = await queryRunner.manager.save(payment);

      // If payment successful, update order status
      if (paymentResult.success) {
        order.status = OrderStatus.CONFIRMED;
        await queryRunner.manager.save(order);
      }

      await queryRunner.commitTransaction();

      return this.paymentRepository.findOne({
        where: { id: savedPayment.id },
        relations: ['order'],
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(orderId?: string, userId?: string) {
    const queryBuilder = this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.order', 'order')
      .orderBy('payment.createdAt', 'DESC');

    if (orderId) {
      queryBuilder.where('payment.orderId = :orderId', { orderId });
    }

    if (userId) {
      queryBuilder.andWhere('order.customerId = :userId', { userId });
    }

    return queryBuilder.getMany();
  }

  async findOne(id: string, userId: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ['order'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Verify user owns the order
    if (payment.order.customerId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return payment;
  }

  // Simulate payment gateway processing
  private async processPayment(
    method: PaymentMethod,
    amount: number,
  ): Promise<{ success: boolean; metadata?: Record<string, any> }> {
    // Simulate payment processing delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Simulate payment success (in production, integrate with real payment gateways)
    const success = amount > 0; // Basic validation

    return {
      success,
      metadata: {
        gateway: method,
        processedAt: new Date().toISOString(),
        transactionRef: `REF-${Date.now()}`,
      },
    };
  }

  // Admin function to manually verify payment
  async verifyPayment(id: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ['order'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status === PaymentStatus.COMPLETED) {
      throw new BadRequestException('Payment is already completed');
    }

    payment.status = PaymentStatus.COMPLETED;
    const savedPayment = await this.paymentRepository.save(payment);

    // Update order status
    const order = payment.order;
    order.status = OrderStatus.CONFIRMED;
    await this.orderRepository.save(order);

    return savedPayment;
  }
}
