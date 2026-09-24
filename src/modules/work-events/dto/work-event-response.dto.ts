import { ApiProperty } from '@nestjs/swagger';

import { WorkEventType } from '../work-event.entity';

export class WorkEventResponseDto {
  @ApiProperty({ format: 'uuid' })
  uuid: string;

  @ApiProperty({ format: 'uuid' })
  ownerUserUuid: string;

  @ApiProperty({ format: 'uuid' })
  workUuid: string;

  @ApiProperty({ enum: WorkEventType })
  type: WorkEventType;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ required: false, nullable: true })
  metadata?: unknown;

  @ApiProperty()
  createdAt: Date;
}
