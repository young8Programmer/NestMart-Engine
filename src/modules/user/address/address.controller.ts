import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AddressService } from './address.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/user.decorator';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { User } from '../../../entities/user.entity';

@ApiTags('Addresses')
@Controller('user/addresses')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new address' })
  @ApiResponse({ status: 201, description: 'Address created successfully' })
  async create(
    @CurrentUser() user: User,
    @Body() createAddressDto: CreateAddressDto,
  ) {
    return this.addressService.create(user.id, createAddressDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all user addresses' })
  @ApiResponse({ status: 200, description: 'Addresses retrieved successfully' })
  async findAll(@CurrentUser() user: User) {
    return this.addressService.findAll(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get address by ID' })
  @ApiResponse({ status: 200, description: 'Address retrieved successfully' })
  async findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.addressService.findOne(id, user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update address' })
  @ApiResponse({ status: 200, description: 'Address updated successfully' })
  async update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() updateAddressDto: UpdateAddressDto,
  ) {
    return this.addressService.update(id, user.id, updateAddressDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete address' })
  @ApiResponse({ status: 200, description: 'Address deleted successfully' })
  async remove(@CurrentUser() user: User, @Param('id') id: string) {
    await this.addressService.remove(id, user.id);
    return { message: 'Address deleted successfully' };
  }
}
