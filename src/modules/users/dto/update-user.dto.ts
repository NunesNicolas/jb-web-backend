import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

import { UserProfile } from '../user.entity';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Nicolas Nunes' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'nicolas@empresa.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '(51) 99999-9999' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ enum: UserProfile, example: UserProfile.Operations })
  @IsEnum(UserProfile)
  @IsOptional()
  profile?: UserProfile;

  @ApiPropertyOptional({ example: 'novaSenha123', minLength: 6 })
  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;
}
