import { IsIn, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TransitionStatusDto {
  @ApiProperty({
    description: 'Target status',
    enum: ['in_separation', 'shipped', 'delivered'],
  })
  @IsNotEmpty({ message: 'status is required' })
  @IsIn(['in_separation', 'shipped', 'delivered'], {
    message: 'status must be one of: in_separation, shipped, delivered',
  })
  status: 'in_separation' | 'shipped' | 'delivered';
}
