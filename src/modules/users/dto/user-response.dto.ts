import { ApiProperty } from '@nestjs/swagger';

import { UserProfile } from '../user.entity';

export class UserResponseDto {
  @ApiProperty({ format: 'uuid' })
  uuid: string;

  @ApiProperty({ example: 'Nicolas Nunes' })
  name: string;

  @ApiProperty({ example: 'nicolas@empresa.com' })
  email: string;

  @ApiProperty({ example: '(51) 99999-9999' })
  phone: string;

  @ApiProperty({ enum: UserProfile, example: UserProfile.Operations })
  profile: UserProfile;

  @ApiProperty({ example: '2026-07-10T13:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-07-10T13:00:00.000Z' })
  updatedAt: Date;
}
