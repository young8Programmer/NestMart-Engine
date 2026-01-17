import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AddressController } from './address/address.controller';
import { AddressService } from './address/address.service';
import { User } from '../../entities/user.entity';
import { Address } from '../../entities/address.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Address])],
  controllers: [UserController, AddressController],
  providers: [UserService, AddressService],
  exports: [UserService],
})
export class UserModule {}
