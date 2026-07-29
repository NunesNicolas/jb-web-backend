import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateGroupDto {
  @ApiPropertyOptional({ example: 'Equipe Residencial Aurora' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;
}
