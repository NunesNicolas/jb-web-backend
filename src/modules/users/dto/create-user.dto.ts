import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';

import { UserProfile } from '../user.entity';

export class CreateUserDto {
  @ApiProperty({ example: 'Nicolas Nunes' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'nicolas@empresa.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '(51) 99999-9999' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ enum: UserProfile, example: UserProfile.Operations })
  @IsEnum(UserProfile)
  profile: UserProfile;

  @ApiProperty({ example: 'senha123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;
}
