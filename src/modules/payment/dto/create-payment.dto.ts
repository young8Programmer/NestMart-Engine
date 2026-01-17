import { IsEnum, IsUUID, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod } from '../../../common/enums/payment-method.enum';

export class CreatePaymentDto {
  @ApiProperty({ example: 'order-uuid' })
  @IsUUID()
  orderId: string;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.PAYME })
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @ApiProperty({ example: 999.99 })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ example: 'Payment notes', required: false })
  @IsOptional()
  notes?: string;
}
