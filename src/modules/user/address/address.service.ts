import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from '../../../entities/address.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(Address)
    private addressRepository: Repository<Address>,
  ) {}

  async create(userId: string, createAddressDto: CreateAddressDto): Promise<Address> {
    const address = this.addressRepository.create({
      ...createAddressDto,
      userId,
    });

    // If this is set as default, unset other default addresses
    if (createAddressDto.isDefault) {
      await this.addressRepository.update(
        { userId, isDefault: true },
        { isDefault: false },
      );
    }

    return this.addressRepository.save(address);
  }

  async findAll(userId: string): Promise<Address[]> {
    return this.addressRepository.find({
      where: { userId },
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Address> {
    const address = await this.addressRepository.findOne({
      where: { id, userId },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    return address;
  }

  async update(
    id: string,
    userId: string,
    updateAddressDto: UpdateAddressDto,
  ): Promise<Address> {
    const address = await this.findOne(id, userId);

    // If setting as default, unset other default addresses
    if (updateAddressDto.isDefault) {
      await this.addressRepository.update(
        { userId, isDefault: true },
        { isDefault: false },
      );
    }

    Object.assign(address, updateAddressDto);
    return this.addressRepository.save(address);
  }

  async remove(id: string, userId: string): Promise<void> {
    const address = await this.findOne(id, userId);
    await this.addressRepository.softRemove(address);
  }
}
