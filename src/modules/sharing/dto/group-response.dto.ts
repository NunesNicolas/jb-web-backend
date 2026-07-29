import { ApiProperty } from '@nestjs/swagger';

import { GroupMemberResponseDto } from './group-member-response.dto';
import { GroupWorkResponseDto } from './group-work-response.dto';

export class GroupResponseDto {
  @ApiProperty({ format: 'uuid' })
  uuid: string;

  @ApiProperty({ format: 'uuid' })
  ownerUserUuid: string;

  @ApiProperty({ example: 'Equipe Residencial Aurora' })
  name: string;

  @ApiProperty({ type: GroupMemberResponseDto, isArray: true })
  members: GroupMemberResponseDto[];

  @ApiProperty({ type: GroupWorkResponseDto, isArray: true })
  works: GroupWorkResponseDto[];

  @ApiProperty({ example: '2026-07-10T13:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-07-10T13:00:00.000Z' })
  updatedAt: Date;
}
