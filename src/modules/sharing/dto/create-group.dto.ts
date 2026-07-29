import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateGroupDto {
  @ApiProperty({ example: 'Equipe Residencial Aurora' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
