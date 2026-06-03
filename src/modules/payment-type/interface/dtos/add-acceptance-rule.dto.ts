import { IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddAcceptanceRuleDto {
  @ApiProperty({
    description: 'Minimum accepted value',
    minimum: 0.01,
    maximum: 999999999.99,
  })
  @IsNumber({}, { message: 'minValue must be a valid number' })
  @Min(0.01, { message: 'minValue must be between 0.01 and 999999999.99' })
  @Max(999999999.99, { message: 'minValue must be between 0.01 and 999999999.99' })
  minValue: number;

  @ApiProperty({
    description: 'Maximum accepted value',
    minimum: 0.01,
    maximum: 999999999.99,
  })
  @IsNumber({}, { message: 'maxValue must be a valid number' })
  @Min(0.01, { message: 'maxValue must be between 0.01 and 999999999.99' })
  @Max(999999999.99, { message: 'maxValue must be between 0.01 and 999999999.99' })
  maxValue: number;
}
