import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

import { WorkStatus } from '../work.entity';

export class CreateWorkDto {
  @ApiProperty({ example: 'Residencial Aurora' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Rua das Palmeiras, 184' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: -51.23019 })
  @IsNumber()
  @IsLongitude()
  longitude: number;

  @ApiProperty({ example: -30.03306 })
  @IsNumber()
  @IsLatitude()
  latitude: number;

  @ApiProperty({ example: 480000, minimum: 0 })
  @IsNumber()
  @Min(0)
  estimatedPrice: number;

  @ApiProperty({
    example: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...',
    required: false,
    description: 'Imagem de capa em Data URL ou URL pública.',
  })
  @IsString()
  @IsOptional()
  coverImageUrl?: string;

  @ApiProperty({ enum: WorkStatus, example: WorkStatus.InProgress })
  @IsEnum(WorkStatus)
  status: WorkStatus;
}
