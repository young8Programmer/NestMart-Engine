import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UserRole } from '../../common/enums/user-role.enum';
import { User } from '../../entities/user.entity';

@ApiTags('Payments')
@Controller('payments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @Roles(UserRole.CUSTOMER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Create a new payment (Customer only)' })
  @ApiResponse({ status: 201, description: 'Payment created successfully' })
  async create(@CurrentUser() user: User, @Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentService.create(user.id, createPaymentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all payments' })
  @ApiResponse({ status: 200, description: 'Payments retrieved successfully' })
  async findAll(
    @CurrentUser() user: User,
    @Query('orderId') orderId?: string,
  ) {
    return this.paymentService.findAll(orderId, user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiResponse({ status: 200, description: 'Payment retrieved successfully' })
  async findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.paymentService.findOne(id, user.id);
  }

  @Put(':id/verify')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Verify payment (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Payment verified successfully' })
  async verifyPayment(@Param('id') id: string) {
    return this.paymentService.verifyPayment(id);
  }
}
