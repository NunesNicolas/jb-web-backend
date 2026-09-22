import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

import { TaskPriority, TaskStatus } from '../task.entity';

export class UpdateTaskDto {
  @ApiPropertyOptional({ example: 'Conferir avanço da alvenaria' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: 'Validar frente do bloco A antes da medição.' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  @IsString()
  @IsOptional()
  workUuid?: string | null;

  @ApiPropertyOptional({ example: 'Maria - Engenharia' })
  @IsString()
  @IsOptional()
  assignee?: string;

  @ApiPropertyOptional({ example: '2026-10-02', nullable: true })
  @IsDateString()
  @IsOptional()
  dueDate?: string | null;

  @ApiPropertyOptional({ enum: TaskStatus, example: TaskStatus.InProgress })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @ApiPropertyOptional({ enum: TaskPriority, example: TaskPriority.High })
  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @ApiPropertyOptional({ example: 1, minimum: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  position?: number;
}
