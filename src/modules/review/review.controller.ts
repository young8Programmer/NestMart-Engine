import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewService } from './review.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { UserRole } from '../../common/enums/user-role.enum';
import { User } from '../../entities/user.entity';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new review (Customer only)' })
  @ApiResponse({ status: 201, description: 'Review created successfully' })
  async create(@CurrentUser() user: User, @Body() createReviewDto: CreateReviewDto) {
    return this.reviewService.create(user.id, createReviewDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all reviews' })
  @ApiResponse({ status: 200, description: 'Reviews retrieved successfully' })
  async findAll(@Query('productId') productId?: string) {
    return this.reviewService.findAll(productId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get review by ID' })
  @ApiResponse({ status: 200, description: 'Review retrieved successfully' })
  async findOne(@Param('id') id: string) {
    return this.reviewService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update review (Owner only)' })
  @ApiResponse({ status: 200, description: 'Review updated successfully' })
  async update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    return this.reviewService.update(id, user.id, updateReviewDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete review (Owner only)' })
  @ApiResponse({ status: 200, description: 'Review deleted successfully' })
  async remove(@CurrentUser() user: User, @Param('id') id: string) {
    await this.reviewService.remove(id, user.id);
    return { message: 'Review deleted successfully' };
  }
}
