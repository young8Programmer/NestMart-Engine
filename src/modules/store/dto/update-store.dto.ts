import { IsString, IsOptional, MinLength, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateStoreDto {
  @ApiProperty({ example: 'My Updated Store', required: false })
  @IsOptional()
  @IsString()
  @MinLength(3)
  name?: string;

  @ApiProperty({ example: 'Updated description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'my-updated-store', required: false })
  @IsOptional()
  @IsString()
  @MinLength(3)
  slug?: string;

  @ApiProperty({ example: 'https://example.com/logo.png', required: false })
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiProperty({ example: 'https://example.com/banner.png', required: false })
  @IsOptional()
  @IsString()
  banner?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
