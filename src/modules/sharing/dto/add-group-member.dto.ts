import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum } from 'class-validator';

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
}
