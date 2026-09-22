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
  Query,
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
import { CreateTaskDto, TaskResponseDto, UpdateTaskDto } from './dto';
import { TasksService } from './tasks.service';

@ApiTags('tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Criar tarefa' })
  @ApiCreatedResponse({ type: TaskResponseDto })
  create(
    @Req() request: AuthenticatedRequest,
    @Body() createTaskDto: CreateTaskDto,
  ): Promise<TaskResponseDto> {
    return this.tasksService.create(request.user.sub, createTaskDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar tarefas' })
  @ApiOkResponse({ type: TaskResponseDto, isArray: true })
  findAll(
    @Req() request: AuthenticatedRequest,
    @Query('workUuid') workUuid?: string,
  ): Promise<TaskResponseDto[]> {
    return this.tasksService.findAll(request.user.sub, workUuid);
  }

  @Get(':uuid')
  @ApiOperation({ summary: 'Buscar tarefa por UUID' })
  @ApiOkResponse({ type: TaskResponseDto })
  findOne(
    @Req() request: AuthenticatedRequest,
    @Param('uuid') uuid: string,
  ): Promise<TaskResponseDto> {
    return this.tasksService.findOne(request.user.sub, uuid);
  }

  @Patch(':uuid')
  @ApiOperation({ summary: 'Atualizar tarefa por UUID' })
  @ApiOkResponse({ type: TaskResponseDto })
  update(
    @Req() request: AuthenticatedRequest,
    @Param('uuid') uuid: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ): Promise<TaskResponseDto> {
    return this.tasksService.update(request.user.sub, uuid, updateTaskDto);
  }

  @Delete(':uuid')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover tarefa por UUID' })
  @ApiNoContentResponse()
  remove(
    @Req() request: AuthenticatedRequest,
    @Param('uuid') uuid: string,
  ): Promise<void> {
    return this.tasksService.remove(request.user.sub, uuid);
  }
}
