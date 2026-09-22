import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { TaskPriority, TaskStatus } from '../task.entity';

export class TaskResponseDto {
  @ApiProperty({ format: 'uuid' })
  uuid: string;

  @ApiProperty({ format: 'uuid' })
  ownerUserUuid: string;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  workUuid: string | null;

  @ApiProperty({ example: 'Conferir avanço da alvenaria' })
  title: string;

  @ApiProperty({ example: 'Validar frente do bloco A antes da medição.' })
  description: string;

  @ApiProperty({ example: 'Maria - Engenharia' })
  assignee: string;

  @ApiPropertyOptional({ example: '2026-10-02T00:00:00.000Z', nullable: true })
  dueDate: Date | null;

  @ApiProperty({ enum: TaskStatus, example: TaskStatus.Todo })
  status: TaskStatus;

  @ApiProperty({ enum: TaskPriority, example: TaskPriority.High })
  priority: TaskPriority;

  @ApiProperty({ example: 0 })
  position: number;

  @ApiProperty({ example: 'Residencial Aurora' })
  workName: string | null;

  @ApiProperty({ example: '2026-09-22T13:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-09-22T13:00:00.000Z' })
  updatedAt: Date;
}
