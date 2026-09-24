import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

import { RevenueType } from '../revenue.entity';

export class CreateRevenueDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  workUuid: string;

  @ApiProperty({ enum: RevenueType, example: RevenueType.Sale })
  @IsEnum(RevenueType)
  type: RevenueType;

  @ApiProperty({ example: 'Venda da unidade 301' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 250000, minimum: 0 })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ example: '2026-09-22' })
  @IsDateString()
  receivedAt: string;
}
