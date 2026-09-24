import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsUUID } from 'class-validator';

import { WorkAccessLevel } from '../access-level.entity';

export class UpdateGroupMemberDto {
  @ApiPropertyOptional({ enum: WorkAccessLevel })
  @IsEnum(WorkAccessLevel)
  @IsOptional()
  accessLevel?: WorkAccessLevel;

  @ApiPropertyOptional({ format: 'uuid', isArray: true })
  @IsArray()
  @IsOptional()
  @IsUUID('4', { each: true })
  workUuids?: string[];
}
