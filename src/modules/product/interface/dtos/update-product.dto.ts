import { IsString, IsNotEmpty, MaxLength, IsNumber, Min, Max, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProductDto {
  @ApiPropertyOptional({ description: 'Product name', maxLength: 150 })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'name must be between 1 and 150 characters' })
  @MaxLength(150, { message: 'name must be between 1 and 150 characters' })
  name?: string;

  @ApiPropertyOptional({ description: 'Product description', maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ description: 'Unit price', minimum: 0.01, maximum: 999999.99 })
  @IsOptional()
  @IsNumber({}, { message: 'unitPrice must be between 0.01 and 999999.99' })
  @Min(0.01, { message: 'unitPrice must be between 0.01 and 999999.99' })
  @Max(999999.99, { message: 'unitPrice must be between 0.01 and 999999.99' })
  unitPrice?: number;

  @ApiPropertyOptional({ description: 'Product category', maxLength: 100 })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'category must be between 1 and 100 characters' })
  @MaxLength(100, { message: 'category must be between 1 and 100 characters' })
  category?: string;
}
