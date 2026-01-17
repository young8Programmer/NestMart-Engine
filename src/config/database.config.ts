import { Injectable } from '@nestjs/common';
import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../entities/user.entity';
import { Store } from '../entities/store.entity';
import { Product } from '../entities/product.entity';
import { Category } from '../entities/category.entity';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { Review } from '../entities/review.entity';
import { Payment } from '../entities/payment.entity';
import { Address } from '../entities/address.entity';

@Injectable()
export class DatabaseConfig implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.configService.get<string>('DB_HOST', 'localhost'),
      port: this.configService.get<number>('DB_PORT', 5432),
      username: this.configService.get<string>('DB_USERNAME', 'postgres'),
      password: this.configService.get<string>('DB_PASSWORD', 'postgres'),
      database: this.configService.get<string>('DB_DATABASE', 'nestmart'),
      entities: [
        User,
        Store,
        Product,
        Category,
        Order,
        OrderItem,
        Review,
        Payment,
        Address,
      ],
      synchronize: this.configService.get<string>('NODE_ENV') !== 'production',
      logging: this.configService.get<string>('NODE_ENV') === 'development',
      ssl: false,
    };
  }
}
