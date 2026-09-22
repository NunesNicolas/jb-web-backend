import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

import { WorkStatus } from '../work.entity';

export class UpdateWorkDto {
  @ApiPropertyOptional({ example: 'Residencial Aurora' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'Rua das Palmeiras, 184' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: -51.23019 })
  @IsNumber()
  @IsLongitude()
  @IsOptional()
  longitude?: number;

  @ApiPropertyOptional({ example: -30.03306 })
  @IsNumber()
  @IsLatitude()
  @IsOptional()
  latitude?: number;

  @ApiPropertyOptional({ example: 480000, minimum: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  estimatedPrice?: number;

  @ApiPropertyOptional({ example: 515000, minimum: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  finalBudget?: number;

  @ApiPropertyOptional({
    example: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...',
    description: 'Imagem de capa em Data URL, URL pública ou vazio para remover.',
  })
  @IsString()
  @IsOptional()
  coverImageUrl?: string;

  @ApiPropertyOptional({ enum: WorkStatus, example: WorkStatus.InProgress })
  @IsEnum(WorkStatus)
  @IsOptional()
  status?: WorkStatus;
}
