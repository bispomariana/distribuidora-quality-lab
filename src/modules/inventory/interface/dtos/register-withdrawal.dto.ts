import { IsString, IsNotEmpty, IsInt, Min, IsUUID, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterWithdrawalDto {
  @ApiProperty({ description: 'Product ID (UUID)' })
  @IsString()
  @IsNotEmpty()
  @IsUUID('4', { message: 'productId must be a valid UUID' })
  productId: string;

  @ApiProperty({ description: 'Quantity to withdraw from stock', minimum: 1 })
  @IsInt({ message: 'quantity must be a positive integer greater than 0' })
  @Min(1, { message: 'quantity must be a positive integer greater than 0' })
  quantity: number;

  @ApiProperty({ description: 'Reason for withdrawal' })
  @IsString()
  @IsNotEmpty({ message: 'reason is required for withdrawals' })
  @MinLength(1, { message: 'reason is required for withdrawals' })
  reason: string;
}
