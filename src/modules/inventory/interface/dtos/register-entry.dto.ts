import { IsString, IsNotEmpty, IsInt, Min, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterEntryDto {
  @ApiProperty({ description: 'Product ID (UUID)' })
  @IsString()
  @IsNotEmpty()
  @IsUUID('4', { message: 'productId must be a valid UUID' })
  productId: string;

  @ApiProperty({ description: 'Quantity to add to stock', minimum: 1 })
  @IsInt({ message: 'quantity must be a positive integer greater than 0' })
  @Min(1, { message: 'quantity must be a positive integer greater than 0' })
  quantity: number;
}
