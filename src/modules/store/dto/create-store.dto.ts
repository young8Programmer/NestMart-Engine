import { IsString, IsOptional, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStoreDto {
  @ApiProperty({ example: 'My Awesome Store' })
  @IsString()
  @MinLength(3)
  name: string;

  @ApiProperty({ example: 'This is my store description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'my-awesome-store' })
  @IsString()
  @MinLength(3)
  slug: string;

  @ApiProperty({ example: 'https://example.com/logo.png', required: false })
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiProperty({ example: 'https://example.com/banner.png', required: false })
  @IsOptional()
  @IsString()
  banner?: string;
}
