import { ApiProperty } from '@nestjs/swagger';

import { WorkAccessLevel } from '../access-level.entity';

export class GroupMemberResponseDto {
  @ApiProperty({ format: 'uuid' })
  uuid: string;

  @ApiProperty({ format: 'uuid' })
  userUuid: string;

  @ApiProperty({ example: 'Nicolas Nunes' })
  name: string;

  @ApiProperty({ example: 'nicolas@empresa.com' })
  email: string;

  @ApiProperty({
    enum: WorkAccessLevel,
    example: WorkAccessLevel.Contributor,
  })
  accessLevel: WorkAccessLevel;
}
