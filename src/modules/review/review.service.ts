import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Review } from '../../entities/review.entity';
import { Product } from '../../entities/product.entity';
import { Order } from '../../entities/order.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    private dataSource: DataSource,
  ) {}

  async create(userId: string, createReviewDto: CreateReviewDto): Promise<Review> {
    // Verify product exists
    const product = await this.productRepository.findOne({
      where: { id: createReviewDto.productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Check if user already reviewed this product
    const existingReview = await this.reviewRepository.findOne({
      where: { userId, productId: createReviewDto.productId },
    });

    if (existingReview) {
      throw new BadRequestException('You have already reviewed this product');
    }

    // Check if user has purchased the product (optional - for verified reviews)
    const hasPurchased = await this.orderRepository
      .createQueryBuilder('order')
      .innerJoin('order.items', 'item')
      .where('order.customerId = :userId', { userId })
      .andWhere('item.productId = :productId', { productId: createReviewDto.productId })
      .andWhere('order.status = :status', { status: 'DELIVERED' })
      .getCount();

    const review = this.reviewRepository.create({
      ...createReviewDto,
      userId,
      productId: createReviewDto.productId,
      isVerified: hasPurchased > 0,
    });

    const savedReview = await this.reviewRepository.save(review);

    // Update product rating and review count
    await this.updateProductRating(createReviewDto.productId);

    return savedReview;
  }

  async findAll(productId?: string) {
    const queryBuilder = this.reviewRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .leftJoinAndSelect('review.product', 'product')
      .orderBy('review.createdAt', 'DESC');

    if (productId) {
      queryBuilder.where('review.productId = :productId', { productId });
    }

    return queryBuilder.getMany();
  }

  async findOne(id: string): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: ['user', 'product'],
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return review;
  }

  async update(
    id: string,
    userId: string,
    updateReviewDto: UpdateReviewDto,
  ): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id, userId },
      relations: ['product'],
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Store old rating for recalculation
    const oldRating = review.rating;

    Object.assign(review, updateReviewDto);
    const savedReview = await this.reviewRepository.save(review);

    // Update product rating if rating changed
    if (updateReviewDto.rating && updateReviewDto.rating !== oldRating) {
      await this.updateProductRating(review.productId);
    }

    return savedReview;
  }

  async remove(id: string, userId: string): Promise<void> {
    const review = await this.reviewRepository.findOne({
      where: { id, userId },
      relations: ['product'],
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    const productId = review.productId;

    await this.reviewRepository.softRemove(review);

    // Update product rating after deletion
    await this.updateProductRating(productId);
  }

  private async updateProductRating(productId: string): Promise<void> {
    const reviews = await this.reviewRepository.find({
      where: { productId },
    });

    if (reviews.length === 0) {
      return;
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    await this.productRepository.update(productId, {
      rating: Math.round(averageRating * 100) / 100, // Round to 2 decimal places
      reviewCount: reviews.length,
    });
  }
}
