import { IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePaymentTypeDto {
  @ApiProperty({ description: 'Payment type name', maxLength: 100 })
  @IsString()
  @IsNotEmpty({ message: 'name must be between 1 and 100 characters' })
  @MaxLength(100, { message: 'name must be between 1 and 100 characters' })
  name: string;

  @ApiPropertyOptional({ description: 'Payment type description', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'description must be at most 500 characters' })
  description?: string;
}
