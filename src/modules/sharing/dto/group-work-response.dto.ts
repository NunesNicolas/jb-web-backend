import { ApiProperty } from '@nestjs/swagger';

import { WorkStatus } from '../../works/work.entity';

export class GroupWorkResponseDto {
  @ApiProperty({ format: 'uuid' })
  uuid: string;

  @ApiProperty({ example: 'Residencial Aurora' })
  name: string;

  @ApiProperty({ example: 'Rua das Palmeiras, 184' })
  address: string;

  @ApiProperty({ enum: WorkStatus, example: WorkStatus.InProgress })
  status: WorkStatus;
}
