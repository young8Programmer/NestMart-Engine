import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { UserRole } from '../../common/enums/user-role.enum';
import { User } from '../../entities/user.entity';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @Roles(UserRole.CUSTOMER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Create a new order (Customer only)' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  async create(@CurrentUser() user: User, @Body() createOrderDto: CreateOrderDto) {
    return this.orderService.create(user.id, createOrderDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all orders' })
  @ApiResponse({ status: 200, description: 'Orders retrieved successfully' })
  async findAll(@CurrentUser() user: User) {
    return this.orderService.findAll(user.id, user.role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiResponse({ status: 200, description: 'Order retrieved successfully' })
  async findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.orderService.findOne(id, user.id, user.role);
  }

  @Put(':id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SELLER, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update order status (Seller or Admin only)' })
  @ApiResponse({ status: 200, description: 'Order status updated successfully' })
  async updateStatus(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateOrderStatusDto,
  ) {
    return this.orderService.updateStatus(id, user.id, user.role, updateStatusDto);
  }

  @Put(':id/cancel')
  @UseGuards(RolesGuard)
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({ summary: 'Cancel order (Customer only)' })
  @ApiResponse({ status: 200, description: 'Order cancelled successfully' })
  async cancelOrder(@CurrentUser() user: User, @Param('id') id: string) {
    return this.orderService.cancelOrder(id, user.id);
  }
}
