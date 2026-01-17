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
import { ProductService } from './product.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';
import { UserRole } from '../../common/enums/user-role.enum';
import { User } from '../../entities/user.entity';

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post('stores/:storeId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SELLER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new product (Seller only)' })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  async create(
    @CurrentUser() user: User,
    @Param('storeId') storeId: string,
    @Body() createProductDto: CreateProductDto,
  ) {
    return this.productService.create(storeId, user.id, createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products with filtering' })
  @ApiResponse({ status: 200, description: 'Products retrieved successfully' })
  async findAll(@Query() filterDto: FilterProductDto) {
    return this.productService.findAll(filterDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiResponse({ status: 200, description: 'Product retrieved successfully' })
  async findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @Get('stores/:storeId/my-products')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SELLER, UserRole.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all products for a store (Owner or Admin)' })
  @ApiResponse({ status: 200, description: 'Products retrieved successfully' })
  async findByStore(
    @CurrentUser() user: User,
    @Param('storeId') storeId: string,
  ) {
    return this.productService.findByStore(storeId, user.id, user.role);
  }

  @Put(':id/stores/:storeId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SELLER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update product (Owner only)' })
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  async update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Param('storeId') storeId: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productService.update(id, storeId, user.id, updateProductDto);
  }

  @Delete(':id/stores/:storeId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SELLER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete product (Owner only)' })
  @ApiResponse({ status: 200, description: 'Product deleted successfully' })
  async remove(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Param('storeId') storeId: string,
  ) {
    await this.productService.remove(id, storeId, user.id);
    return { message: 'Product deleted successfully' };
  }
}
