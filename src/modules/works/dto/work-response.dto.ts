import { ApiProperty } from '@nestjs/swagger';

import { WorkStatus } from '../work.entity';

export class WorkResponseDto {
  @ApiProperty({ format: 'uuid' })
  uuid: string;

  @ApiProperty({ format: 'uuid' })
  ownerUserUuid: string;

  @ApiProperty({ example: 'Residencial Aurora' })
  name: string;

  @ApiProperty({ example: 'Rua das Palmeiras, 184' })
  address: string;

  @ApiProperty({ example: -51.23019 })
  longitude: number;

  @ApiProperty({ example: -30.03306 })
  latitude: number;

  @ApiProperty({ example: 480000 })
  estimatedPrice: number;

  @ApiProperty({ example: 515000 })
  finalBudget: number;

  @ApiProperty({
    example: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...',
    description: 'Imagem de capa em Data URL ou URL pública.',
  })
  coverImageUrl: string;

  @ApiProperty({ enum: WorkStatus, example: WorkStatus.InProgress })
  status: WorkStatus;

  @ApiProperty({ example: '2026-07-10T13:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-07-10T13:00:00.000Z' })
  updatedAt: Date;
}
