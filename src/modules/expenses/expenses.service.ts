import { Injectable, NotFoundException } from '@nestjs/common';
import { Expense as PrismaExpense } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { WorkAccessLevel } from '../sharing/access-level.entity';
import { GroupsService } from '../sharing/groups.service';
import { CreateExpenseDto, ExpenseResponseDto, UpdateExpenseDto } from './dto';
import { ExpenseType } from './expense.entity';

@Injectable()
export class ExpensesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly groupsService: GroupsService,
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
        uploadUrl: createExpenseDto.uploadUrl.trim(),
      },
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
      name: string;
      description: string;
      amount: number;
      uploadUrl: string;
    }> = {};

    if (updateExpenseDto.type) {
      data.type = updateExpenseDto.type;
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
      throw new NotFoundException('Despesa nao encontrada.');
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
                    accessLevel: {
                      in: [
                        WorkAccessLevel.Contributor,
                        WorkAccessLevel.HeadModerator,
                        WorkAccessLevel.Viewer,
                        WorkAccessLevel.AdvancedViewer,
                      ],
                    },
                  },
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
      name: expense.name,
      description: expense.description,
      amount: expense.amount,
      uploadUrl: expense.uploadUrl,
      createdAt: expense.createdAt,
      updatedAt: expense.updatedAt,
    };
  }
}
