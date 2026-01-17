import { IsInt, Min, Max, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({ example: 'product-uuid' })
  @IsUUID()
  productId: string;

  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ example: 'Great product! Highly recommend.', required: false })
  @IsOptional()
  @IsString()
  comment?: string;
}
