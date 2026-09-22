import { ApiProperty } from '@nestjs/swagger';

import { ExpenseType } from '../expense.entity';

export class ExpenseResponseDto {
  @ApiProperty({ format: 'uuid' })
  uuid: string;

  @ApiProperty({ format: 'uuid' })
  ownerUserUuid: string;

  @ApiProperty({ format: 'uuid' })
  workUuid: string;

  @ApiProperty({ enum: ExpenseType, example: ExpenseType.Material })
  type: ExpenseType;

  @ApiProperty({ example: 'Compra de cimento' })
  name: string;

  @ApiProperty({ example: 'Compra de 40 sacos para alvenaria do bloco A.' })
  description: string;

  @ApiProperty({ example: 1850.75 })
  amount: number;

  @ApiProperty({
    example: 'uploads/expenses/receipt-8fd4.jpg',
    description: 'Link, código ou referência do arquivo enviado.',
  })
  uploadUrl: string;

  @ApiProperty({ example: '2026-07-10T13:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-07-10T13:00:00.000Z' })
  updatedAt: Date;
}
