import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

import { TaskPriority, TaskStatus } from '../task.entity';

export class CreateTaskDto {
  @ApiProperty({ example: 'Conferir avanço da alvenaria' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'Validar frente do bloco A antes da medição.' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsString()
  @IsOptional()
  workUuid?: string;

  @ApiPropertyOptional({ example: 'Maria - Engenharia' })
  @IsString()
  @IsOptional()
  assignee?: string;

  @ApiPropertyOptional({ example: '2026-10-02' })
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiPropertyOptional({ enum: TaskStatus, example: TaskStatus.Todo })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @ApiPropertyOptional({ enum: TaskPriority, example: TaskPriority.High })
  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @ApiPropertyOptional({ example: 0, minimum: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  position?: number;
}
