import { ApiProperty } from '@nestjs/swagger';

import { RevenueType } from '../revenue.entity';

export class RevenueResponseDto {
  @ApiProperty({ format: 'uuid' })
  uuid: string;

  @ApiProperty({ format: 'uuid' })
  ownerUserUuid: string;

  @ApiProperty({ format: 'uuid' })
  workUuid: string;

  @ApiProperty({ enum: RevenueType })
  type: RevenueType;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  receivedAt: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
