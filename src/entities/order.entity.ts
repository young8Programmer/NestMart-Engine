import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Store } from './store.entity';
import { Address } from './address.entity';
import { OrderItem } from './order-item.entity';
import { Payment } from './payment.entity';
import { OrderStatus } from '../common/enums/order-status.enum';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  orderNumber: string;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  shippingCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  commission: number; // Platform commission

  @Column({ type: 'text', nullable: true })
  notes: string;

  // Relations
  @ManyToOne(() => User, (user) => user.orders, { onDelete: 'CASCADE' })
  @JoinColumn()
  customer: User;

  @Column()
  customerId: string;

  @ManyToOne(() => Store, (store) => store.orders, { onDelete: 'CASCADE' })
  @JoinColumn()
  store: Store;

  @Column()
  storeId: string;

  @ManyToOne(() => Address, { nullable: true })
  @JoinColumn()
  shippingAddress: Address;

  @Column({ nullable: true })
  shippingAddressId: string;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, {
    cascade: true,
  })
  items: OrderItem[];

  @OneToMany(() => Payment, (payment) => payment.order)
  payments: Payment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
