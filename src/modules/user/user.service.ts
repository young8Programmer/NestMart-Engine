import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findOneById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['store', 'addresses'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findOneByEmail(email: string): Promise<User> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['store', 'addresses'],
    });
  }

  async updateProfile(userId: string, updateData: Partial<User>): Promise<User> {
    const user = await this.findOneById(userId);

    Object.assign(user, updateData);

    return this.userRepository.save(user);
  }

  async getProfile(userId: string): Promise<User> {
    const user = await this.findOneById(userId);
    const { password, ...result } = user;
    return result as User;
  }
}
