import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { StoreService } from './store.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { UserRole } from '../../common/enums/user-role.enum';
import { User } from '../../entities/user.entity';

@ApiTags('Stores')
@Controller('stores')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SELLER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new store (Seller only)' })
  @ApiResponse({ status: 201, description: 'Store created successfully' })
  async create(
    @CurrentUser() user: User,
    @Body() createStoreDto: CreateStoreDto,
  ) {
    return this.storeService.create(user.id, createStoreDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all active stores' })
  @ApiResponse({ status: 200, description: 'Stores retrieved successfully' })
  async findAll() {
    return this.storeService.findAll();
  }

  @Get('my-store')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SELLER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get my store (Seller only)' })
  @ApiResponse({ status: 200, description: 'Store retrieved successfully' })
  async findMyStore(@CurrentUser() user: User) {
    return this.storeService.findMyStore(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get store by ID' })
  @ApiResponse({ status: 200, description: 'Store retrieved successfully' })
  async findOne(@Param('id') id: string) {
    return this.storeService.findOne(id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get store by slug' })
  @ApiResponse({ status: 200, description: 'Store retrieved successfully' })
  async findBySlug(@Param('slug') slug: string) {
    return this.storeService.findBySlug(slug);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SELLER, UserRole.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update store (Owner or Admin only)' })
  @ApiResponse({ status: 200, description: 'Store updated successfully' })
  async update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() updateStoreDto: UpdateStoreDto,
  ) {
    return this.storeService.update(id, user.id, updateStoreDto, user.role);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SELLER, UserRole.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete store (Owner or Admin only)' })
  @ApiResponse({ status: 200, description: 'Store deleted successfully' })
  async remove(@CurrentUser() user: User, @Param('id') id: string) {
    await this.storeService.remove(id, user.id, user.role);
    return { message: 'Store deleted successfully' };
  }

  @Put(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Approve store (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Store approved successfully' })
  async approveStore(@Param('id') id: string) {
    return this.storeService.approveStore(id);
  }

  @Put(':id/commission')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Set commission rate (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Commission rate updated successfully' })
  async setCommissionRate(
    @Param('id') id: string,
    @Body('commissionRate') commissionRate: number,
  ) {
    return this.storeService.setCommissionRate(id, commissionRate);
  }
}
