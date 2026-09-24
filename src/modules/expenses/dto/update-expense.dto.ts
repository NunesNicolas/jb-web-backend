import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

import { ExpenseStatus, ExpenseType } from '../expense.entity';

export class UpdateExpenseDto {
  @ApiPropertyOptional({ enum: ExpenseType, example: ExpenseType.Material })
  @IsEnum(ExpenseType)
  @IsOptional()
  type?: ExpenseType;

  @ApiPropertyOptional({ enum: ExpenseStatus, example: ExpenseStatus.Approved })
  @IsEnum(ExpenseStatus)
  @IsOptional()
  status?: ExpenseStatus;

  @ApiPropertyOptional({ example: 'Compra de cimento' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    example: 'Compra de 40 sacos para alvenaria do bloco A.',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 1850.75, minimum: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  amount?: number;

  @ApiPropertyOptional({
    example: 'uploads/expenses/receipt-8fd4.jpg',
    description: 'Link, código ou referência do arquivo enviado.',
  })
  @IsString()
  @IsOptional()
  uploadUrl?: string;
}
