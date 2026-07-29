import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LinkWorkToGroupDto {
  @ApiProperty({ format: 'uuid' })
  @IsString()
  @IsNotEmpty()
  workUuid: string;
}
