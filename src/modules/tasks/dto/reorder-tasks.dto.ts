import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsInt, IsOptional, IsUUID, Min, ValidateNested } from 'class-validator';

import { TaskStatus } from '../task.entity';

class ReorderTaskItemDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  uuid: string;

  @ApiProperty({ enum: TaskStatus })
  @IsEnum(TaskStatus)
  status: TaskStatus;

  @ApiProperty({ format: 'uuid', nullable: true, required: false })
  @IsUUID()
  @IsOptional()
  workUuid?: string | null;

  @ApiProperty({ minimum: 0 })
  @IsInt()
  @Min(0)
  position: number;
}

export class ReorderTasksDto {
  @ApiProperty({ type: [ReorderTaskItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderTaskItemDto)
  tasks: ReorderTaskItemDto[];
}
