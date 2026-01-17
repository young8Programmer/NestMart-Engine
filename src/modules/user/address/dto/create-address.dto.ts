import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAddressDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: '+1234567890' })
  @IsString()
  phone: string;

  @ApiProperty({ example: '123 Main Street' })
  @IsString()
  addressLine1: string;

  @ApiProperty({ example: 'Apt 4B', required: false })
  @IsOptional()
  @IsString()
  addressLine2?: string;

  @ApiProperty({ example: 'New York' })
  @IsString()
  city: string;

  @ApiProperty({ example: 'NY' })
  @IsString()
  state: string;

  @ApiProperty({ example: '10001' })
  @IsString()
  postalCode: string;

  @ApiProperty({ example: 'USA' })
  @IsString()
  country: string;

  @ApiProperty({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
