import { IsUUID, IsArray, ValidateNested, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderItemDto {
  @ApiProperty({ example: 'product-uuid' })
  @IsUUID()
  productId: string;

  @ApiProperty({ example: 2 })
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({ example: 'store-uuid' })
  @IsUUID()
  storeId: string;

  @ApiProperty({ example: 'address-uuid', required: false })
  @IsOptional()
  @IsUUID()
  shippingAddressId?: string;

  @ApiProperty({ type: [CreateOrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @ApiProperty({ example: 'Please handle with care', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
