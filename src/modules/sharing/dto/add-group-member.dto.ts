import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEmail, IsEnum, IsOptional, IsUUID } from 'class-validator';

import { WorkAccessLevel } from '../access-level.entity';

export class AddGroupMemberDto {
  @ApiProperty({ example: 'usuario@empresa.com' })
  @IsEmail()
  email: string;

  @ApiProperty({
    enum: WorkAccessLevel,
    example: WorkAccessLevel.Contributor,
  })
  @IsEnum(WorkAccessLevel)
  accessLevel: WorkAccessLevel;

  @ApiProperty({ format: 'uuid', isArray: true, required: false })
  @IsArray()
  @IsOptional()
  @IsUUID('4', { each: true })
  workUuids?: string[];
}
