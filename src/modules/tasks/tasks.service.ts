import { Injectable, NotFoundException } from '@nestjs/common';
import { Task as PrismaTask, Work as PrismaWork } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { GroupsService } from '../sharing/groups.service';
import { CreateTaskDto, TaskResponseDto, UpdateTaskDto } from './dto';
import { TaskPriority, TaskStatus } from './task.entity';

type TaskWithWork = PrismaTask & { work: PrismaWork | null };

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly groupsService: GroupsService,
  ) {}

  async create(
    ownerUserUuid: string,
    createTaskDto: CreateTaskDto,
  ): Promise<TaskResponseDto> {
    if (createTaskDto.workUuid) {
      await this.groupsService.assertCanEditWork(
        ownerUserUuid,
        createTaskDto.workUuid,
      );
    }

    const status = createTaskDto.status ?? TaskStatus.Todo;
    const position =
      createTaskDto.position ?? (await this.getNextPosition(ownerUserUuid, status));

    const task = await this.prisma.task.create({
      data: {
        ownerUserUuid,
        workUuid: createTaskDto.workUuid,
        title: createTaskDto.title.trim(),
        description: createTaskDto.description?.trim() ?? '',
        assignee: createTaskDto.assignee?.trim() ?? '',
        dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : null,
        status,
        priority: createTaskDto.priority ?? TaskPriority.Medium,
        position,
      },
      include: { work: true },
    });

    return this.toResponse(task);
  }

  async findAll(
    ownerUserUuid: string,
    workUuid?: string,
  ): Promise<TaskResponseDto[]> {
    const tasks = await this.prisma.task.findMany({
      where: {
        ownerUserUuid,
        ...(workUuid ? { workUuid } : {}),
      },
      include: { work: true },
      orderBy: [{ status: 'asc' }, { position: 'asc' }, { createdAt: 'desc' }],
    });

    return tasks.map((task) => this.toResponse(task));
  }

  async findOne(ownerUserUuid: string, uuid: string): Promise<TaskResponseDto> {
    return this.toResponse(await this.findEntityByUuid(ownerUserUuid, uuid));
  }

  async update(
    ownerUserUuid: string,
    uuid: string,
    updateTaskDto: UpdateTaskDto,
  ): Promise<TaskResponseDto> {
    const existingTask = await this.findEntityByUuid(ownerUserUuid, uuid);

    if (updateTaskDto.workUuid) {
      await this.groupsService.assertCanEditWork(
        ownerUserUuid,
        updateTaskDto.workUuid,
      );
    }

    const data: Partial<{
      title: string;
      description: string;
      workUuid: string | null;
      assignee: string;
      dueDate: Date | null;
      status: TaskStatus;
      priority: TaskPriority;
      position: number;
    }> = {};

    if (updateTaskDto.title !== undefined) {
      data.title = updateTaskDto.title.trim();
    }

    if (updateTaskDto.description !== undefined) {
      data.description = updateTaskDto.description.trim();
    }

    if (updateTaskDto.workUuid !== undefined) {
      data.workUuid = updateTaskDto.workUuid || null;
    }

    if (updateTaskDto.assignee !== undefined) {
      data.assignee = updateTaskDto.assignee.trim();
    }

    if (updateTaskDto.dueDate !== undefined) {
      data.dueDate = updateTaskDto.dueDate
        ? new Date(updateTaskDto.dueDate)
        : null;
    }

    if (updateTaskDto.status) {
      data.status = updateTaskDto.status;
    }

    if (updateTaskDto.priority) {
      data.priority = updateTaskDto.priority;
    }

    if (updateTaskDto.position !== undefined) {
      data.position = updateTaskDto.position;
    } else if (updateTaskDto.status && updateTaskDto.status !== existingTask.status) {
      data.position = await this.getNextPosition(ownerUserUuid, updateTaskDto.status);
    }

    const task = await this.prisma.task.update({
      where: { uuid },
      data,
      include: { work: true },
    });

    return this.toResponse(task);
  }

  async remove(ownerUserUuid: string, uuid: string): Promise<void> {
    await this.findEntityByUuid(ownerUserUuid, uuid);
    await this.prisma.task.delete({ where: { uuid } });
  }

  private async findEntityByUuid(
    ownerUserUuid: string,
    uuid: string,
  ): Promise<TaskWithWork> {
    const task = await this.prisma.task.findFirst({
      where: {
        uuid,
        ownerUserUuid,
      },
      include: { work: true },
    });

    if (!task) {
      throw new NotFoundException('Tarefa não encontrada.');
    }

    return task;
  }

  private async getNextPosition(
    ownerUserUuid: string,
    status: TaskStatus,
  ): Promise<number> {
    const aggregate = await this.prisma.task.aggregate({
      where: { ownerUserUuid, status },
      _max: { position: true },
    });

    return (aggregate._max.position ?? -1) + 1;
  }

  private toResponse(task: TaskWithWork): TaskResponseDto {
    return {
      uuid: task.uuid,
      ownerUserUuid: task.ownerUserUuid,
      workUuid: task.workUuid,
      title: task.title,
      description: task.description,
      assignee: task.assignee,
      dueDate: task.dueDate,
      status: task.status as TaskStatus,
      priority: task.priority as TaskPriority,
      position: task.position,
      workName: task.work?.name ?? null,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  }
}
