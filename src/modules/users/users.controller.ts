import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../../common/interfaces/authenticated-request.interface';
import {
  AuthResponseDto,
  CreateUserDto,
  LoginUserDto,
  UpdateUserDto,
  UserResponseDto,
} from './dto';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Criar usuario' })
  @ApiCreatedResponse({ type: UserResponseDto })
  create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.create(createUserDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login do usuario e geracao de JWT por 7 dias' })
  @ApiOkResponse({ type: AuthResponseDto })
  @ApiUnauthorizedResponse({ description: 'Credenciais invalidas' })
  login(@Body() loginUserDto: LoginUserDto): Promise<AuthResponseDto> {
    return this.usersService.login(loginUserDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar usuarios' })
  @ApiOkResponse({ type: UserResponseDto, isArray: true })
  findAll(): Promise<UserResponseDto[]> {
    return this.usersService.findAll();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buscar usuario autenticado' })
  @ApiOkResponse({ type: UserResponseDto })
  findMe(@Req() request: AuthenticatedRequest): Promise<UserResponseDto> {
    return this.usersService.findMe(request.user.sub);
  }

  @Get(':uuid')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buscar usuario por UUID' })
  @ApiOkResponse({ type: UserResponseDto })
  findOne(@Param('uuid') uuid: string): Promise<UserResponseDto> {
    return this.usersService.findOne(uuid);
  }

  @Patch(':uuid')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar usuario por UUID' })
  @ApiOkResponse({ type: UserResponseDto })
  update(
    @Param('uuid') uuid: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.update(uuid, updateUserDto);
  }

  @Delete(':uuid')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remover usuario por UUID' })
  @ApiNoContentResponse()
  remove(@Param('uuid') uuid: string): Promise<void> {
    return this.usersService.remove(uuid);
  }
}
