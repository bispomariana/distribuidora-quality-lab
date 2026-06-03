import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class CreateCustomerDto {
  @ApiProperty({
    description: 'Customer name',
    example: 'João da Silva',
    minLength: 1,
    maxLength: 150,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(150)
  name: string;

  @ApiProperty({
    description: 'CPF (11 digits) or CNPJ (14 digits)',
    example: '12345678909',
  })
  @IsString()
  @IsNotEmpty()
  document: string;

  @ApiProperty({
    description: 'Customer email',
    example: 'joao@example.com',
    maxLength: 254,
  })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(254)
  email: string;

  @ApiProperty({
    description: 'Phone number (10 or 11 digits)',
    example: '11999887766',
  })
  @IsString()
  @IsNotEmpty()
  phone: string;
}
