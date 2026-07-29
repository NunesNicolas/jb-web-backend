import { ApiProperty } from '@nestjs/swagger';

import { WorkAccessLevel, ShareInviteStatus } from '../access-level.entity';

export class ShareInviteResponseDto {
  @ApiProperty({ format: 'uuid' })
  uuid: string;

  @ApiProperty({ example: '9d5f6f1a0d8b4d8b9f0c6e2a' })
  token: string;

  @ApiProperty({ format: 'uuid' })
  groupUuid: string;

  @ApiProperty({ example: 'Equipe Residencial Aurora' })
  groupName: string;

  @ApiProperty({ format: 'uuid' })
  workUuid: string;

  @ApiProperty({ example: 'Residencial Aurora' })
  workName: string;

  @ApiProperty({
    enum: WorkAccessLevel,
    example: WorkAccessLevel.Contributor,
  })
  accessLevel: WorkAccessLevel;

  @ApiProperty({
    enum: ShareInviteStatus,
    example: ShareInviteStatus.Pending,
  })
  status: ShareInviteStatus;

  @ApiProperty({ example: '2026-07-10T13:00:00.000Z' })
  createdAt: Date;
}
