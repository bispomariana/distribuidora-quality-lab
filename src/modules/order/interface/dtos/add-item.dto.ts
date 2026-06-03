import { IsUUID, IsNotEmpty, IsNumber, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddItemDto {
  @ApiProperty({ description: 'Product ID (UUID)' })
  @IsUUID('4', { message: 'productId must be a valid UUID' })
  @IsNotEmpty({ message: 'productId is required' })
  productId: string;

  @ApiProperty({ description: 'Quantity', minimum: 1 })
  @IsInt({ message: 'quantity must be a positive integer' })
  @Min(1, { message: 'quantity must be a positive integer greater than 0' })
  quantity: number;

  @ApiProperty({ description: 'Unit price', minimum: 0.01, maximum: 999999.99 })
  @IsNumber({}, { message: 'unitPrice must be a number' })
  @Min(0.01, { message: 'unitPrice must be between 0.01 and 999999.99' })
  @Max(999999.99, { message: 'unitPrice must be between 0.01 and 999999.99' })
  unitPrice: number;
}
