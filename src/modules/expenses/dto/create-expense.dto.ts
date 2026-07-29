import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

import { ExpenseType } from '../expense.entity';

export class CreateExpenseDto {
  @ApiProperty({ format: 'uuid' })
  @IsString()
  @IsNotEmpty()
  workUuid: string;

  @ApiProperty({ enum: ExpenseType, example: ExpenseType.Material })
  @IsEnum(ExpenseType)
  type: ExpenseType;

  @ApiProperty({ example: 'Compra de cimento' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Compra de 40 sacos para alvenaria do bloco A.' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 1850.75, minimum: 0 })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({
    example: 'uploads/expenses/receipt-8fd4.jpg',
    description: 'Link, codigo ou referencia do arquivo enviado.',
  })
  @IsString()
  @IsNotEmpty()
  uploadUrl: string;
}
