import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

import { WorkAccessLevel } from '../access-level.entity';

export class CreateShareInviteDto {
  @ApiProperty({ format: 'uuid' })
  @IsString()
  @IsNotEmpty()
  groupUuid: string;

  @ApiProperty({ format: 'uuid' })
  @IsString()
  @IsNotEmpty()
  workUuid: string;

  @ApiProperty({
    enum: WorkAccessLevel,
    example: WorkAccessLevel.Contributor,
  })
  @IsEnum(WorkAccessLevel)
  accessLevel: WorkAccessLevel;
}
