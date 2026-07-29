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
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../../common/interfaces/authenticated-request.interface';
import { CreateWorkDto, UpdateWorkDto, WorkResponseDto } from './dto';
import { WorksService } from './works.service';

@ApiTags('works')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('works')
export class WorksController {
  constructor(private readonly worksService: WorksService) {}

  @Post()
  @ApiOperation({ summary: 'Criar obra' })
  @ApiCreatedResponse({ type: WorkResponseDto })
  create(
    @Req() request: AuthenticatedRequest,
    @Body() createWorkDto: CreateWorkDto,
  ): Promise<WorkResponseDto> {
    return this.worksService.create(request.user.sub, createWorkDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar obras' })
  @ApiOkResponse({ type: WorkResponseDto, isArray: true })
  findAll(@Req() request: AuthenticatedRequest): Promise<WorkResponseDto[]> {
    return this.worksService.findAll(request.user.sub);
  }

  @Get(':uuid')
  @ApiOperation({ summary: 'Buscar obra por UUID' })
  @ApiOkResponse({ type: WorkResponseDto })
  findOne(
    @Req() request: AuthenticatedRequest,
    @Param('uuid') uuid: string,
  ): Promise<WorkResponseDto> {
    return this.worksService.findOne(request.user.sub, uuid);
  }

  @Patch(':uuid')
  @ApiOperation({ summary: 'Atualizar obra por UUID' })
  @ApiOkResponse({ type: WorkResponseDto })
  update(
    @Req() request: AuthenticatedRequest,
    @Param('uuid') uuid: string,
    @Body() updateWorkDto: UpdateWorkDto,
  ): Promise<WorkResponseDto> {
    return this.worksService.update(request.user.sub, uuid, updateWorkDto);
  }

  @Delete(':uuid')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover obra por UUID' })
  @ApiNoContentResponse()
  remove(
    @Req() request: AuthenticatedRequest,
    @Param('uuid') uuid: string,
  ): Promise<void> {
    return this.worksService.remove(request.user.sub, uuid);
  }
}
