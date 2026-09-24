import { Injectable, NotFoundException } from '@nestjs/common';
import { Expense as PrismaExpense } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { NotificationType } from '../notifications/notification.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { WorkAccessLevel } from '../sharing/access-level.entity';
import { GroupsService } from '../sharing/groups.service';
import { WorkEventType } from '../work-events/work-event.entity';
import { WorkEventsService } from '../work-events/work-events.service';
import { CreateExpenseDto, ExpenseResponseDto, UpdateExpenseDto } from './dto';
import { ExpenseStatus, ExpenseType } from './expense.entity';

@Injectable()
export class ExpensesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly groupsService: GroupsService,
    private readonly workEventsService: WorkEventsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(
    ownerUserUuid: string,
    createExpenseDto: CreateExpenseDto,
  ): Promise<ExpenseResponseDto> {
    await this.groupsService.assertCanEditWork(
      ownerUserUuid,
      createExpenseDto.workUuid,
    );

    const expense = await this.prisma.expense.create({
      data: {
        ownerUserUuid,
        workUuid: createExpenseDto.workUuid,
        type: createExpenseDto.type,
        name: createExpenseDto.name.trim(),
        description: createExpenseDto.description.trim(),
        amount: createExpenseDto.amount,
        uploadUrl: createExpenseDto.uploadUrl?.trim() ?? '',
      },
    });

    await this.workEventsService.create({
      ownerUserUuid,
      workUuid: expense.workUuid,
      type: WorkEventType.ExpenseCreated,
      title: 'Gasto registrado',
      description: expense.name,
      metadata: { expenseUuid: expense.uuid, amount: expense.amount },
    });
    await this.notificationsService.create({
      ownerUserUuid: expense.ownerUserUuid,
      workUuid: expense.workUuid,
      type: NotificationType.ExpenseCreated,
      title: 'Novo gasto pendente',
      description: `${expense.name} precisa de revisão.`,
    });

    return this.toResponse(expense);
  }

  async findAll(
    ownerUserUuid: string,
    workUuid?: string,
  ): Promise<ExpenseResponseDto[]> {
    const expenses = await this.prisma.expense.findMany({
      where: {
        work: this.accessibleWorkWhere(ownerUserUuid),
        ...(workUuid ? { workUuid } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });

    return expenses.map((expense) => this.toResponse(expense));
  }

  async findOne(
    ownerUserUuid: string,
    uuid: string,
  ): Promise<ExpenseResponseDto> {
    return this.toResponse(await this.findEntityByUuid(ownerUserUuid, uuid));
  }

  async update(
    ownerUserUuid: string,
    uuid: string,
    updateExpenseDto: UpdateExpenseDto,
  ): Promise<ExpenseResponseDto> {
    const existingExpense = await this.findEntityByUuid(ownerUserUuid, uuid);

    await this.groupsService.assertCanEditWork(
      ownerUserUuid,
      existingExpense.workUuid,
    );
    const data: Partial<{
      type: typeof updateExpenseDto.type;
      status: typeof updateExpenseDto.status;
      name: string;
      description: string;
      amount: number;
      uploadUrl: string;
    }> = {};

    if (updateExpenseDto.type) {
      data.type = updateExpenseDto.type;
    }

    if (updateExpenseDto.status) {
      await this.groupsService.assertCanAdvanceWork(
        ownerUserUuid,
        existingExpense.workUuid,
      );
      data.status = updateExpenseDto.status;
    }

    if (updateExpenseDto.name) {
      data.name = updateExpenseDto.name.trim();
    }

    if (updateExpenseDto.description) {
      data.description = updateExpenseDto.description.trim();
    }

    if (updateExpenseDto.amount !== undefined) {
      data.amount = updateExpenseDto.amount;
    }

    if (updateExpenseDto.uploadUrl) {
      data.uploadUrl = updateExpenseDto.uploadUrl.trim();
    }

    const expense = await this.prisma.expense.update({
      where: { uuid },
      data,
    });

    if (
      data.status === ExpenseStatus.Approved &&
      existingExpense.status !== ExpenseStatus.Approved
    ) {
      await this.workEventsService.create({
        ownerUserUuid,
        workUuid: expense.workUuid,
        type: WorkEventType.ExpenseApproved,
        title: 'Gasto aprovado',
        description: expense.name,
        metadata: { expenseUuid: expense.uuid, amount: expense.amount },
      });
    }

    return this.toResponse(expense);
  }

  async remove(ownerUserUuid: string, uuid: string): Promise<void> {
    const existingExpense = await this.findEntityByUuid(ownerUserUuid, uuid);

    await this.groupsService.assertCanEditWork(
      ownerUserUuid,
      existingExpense.workUuid,
    );

    await this.prisma.expense.delete({ where: { uuid } });
  }

  private async findEntityByUuid(
    ownerUserUuid: string,
    uuid: string,
  ): Promise<PrismaExpense> {
    const expense = await this.prisma.expense.findFirst({
      where: {
        uuid,
        work: this.accessibleWorkWhere(ownerUserUuid),
      },
    });

    if (!expense) {
      throw new NotFoundException('Despesa não encontrada.');
    }

    return expense;
  }

  private accessibleWorkWhere(ownerUserUuid: string) {
    return {
      OR: [
        { ownerUserUuid },
        {
          groupWorks: {
            some: {
              group: {
                members: {
                  some: {
                    userUuid: ownerUserUuid,
                    accessLevel: WorkAccessLevel.HeadModerator,
                  },
                },
              },
            },
          },
        },
        {
          memberAccesses: {
            some: {
              member: {
                userUuid: ownerUserUuid,
                accessLevel: {
                  in: [
                    WorkAccessLevel.Contributor,
                    WorkAccessLevel.Viewer,
                    WorkAccessLevel.AdvancedViewer,
                  ],
                },
              },
            },
          },
        },
      ],
    };
  }

  private toResponse(expense: PrismaExpense): ExpenseResponseDto {
    return {
      uuid: expense.uuid,
      ownerUserUuid: expense.ownerUserUuid,
      workUuid: expense.workUuid,
      type: expense.type as ExpenseType,
      status: expense.status as ExpenseStatus,
      name: expense.name,
      description: expense.description,
      amount: expense.amount,
      uploadUrl: expense.uploadUrl,
      createdAt: expense.createdAt,
      updatedAt: expense.updatedAt,
    };
  }
}
