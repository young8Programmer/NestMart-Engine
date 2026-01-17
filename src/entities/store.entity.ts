import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToOne,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Product } from './product.entity';
import { Order } from './order.entity';

@Entity('stores')
export class Store {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ unique: true })
  slug: string;

  @Column({ nullable: true })
  logo: string;

  @Column({ nullable: true })
  banner: string;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ default: false })
  isActive: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  commissionRate: number; // Platform commission rate (set by Super Admin)

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalRevenue: number;

  @Column({ type: 'int', default: 0 })
  totalOrders: number;

  @Column({ type: 'int', default: 0 })
  totalProducts: number;

  // Relations
  @OneToOne(() => User, (user) => user.store)
  @JoinColumn()
  user: User;

  @Column()
  userId: string;

  @OneToMany(() => Product, (product) => product.store)
  products: Product[];

  @OneToMany(() => Order, (order) => order.store)
  orders: Order[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
