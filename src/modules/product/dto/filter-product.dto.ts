import { IsOptional, IsString, IsNumber, Min, IsUUID, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export enum SortField {
  PRICE = 'price',
  RATING = 'rating',
  CREATED_AT = 'createdAt',
  SOLD = 'sold',
}

export class FilterProductDto {
  @ApiProperty({ example: 'iPhone', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ example: 'category-uuid', required: false })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiProperty({ example: 'store-uuid', required: false })
  @IsOptional()
  @IsUUID()
  storeId?: string;

  @ApiProperty({ example: 'Apple', required: false })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiProperty({ example: 100, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiProperty({ example: 1000, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiProperty({ example: 4, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minRating?: number;

  @ApiProperty({ enum: SortField, default: SortField.CREATED_AT, required: false })
  @IsOptional()
  @IsEnum(SortField)
  sortBy?: SortField;

  @ApiProperty({ enum: SortOrder, default: SortOrder.DESC, required: false })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder;

  @ApiProperty({ example: 1, default: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiProperty({ example: 20, default: 20, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;
}
