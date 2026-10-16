import { ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { GroupsService } from '../sharing/groups.service';
import { WorkEventsService } from '../work-events/work-events.service';
import { CreateExpenseDto } from './dto';
import { ExpenseType } from './expense.entity';
import { ExpensesService } from './expenses.service';

describe('Creating expenses without a description', () => {
  const pipe = new ValidationPipe({ transform: true, whitelist: true });
  const base = { workUuid: 'work-1', type: ExpenseType.Material, name: 'Cimento', amount: 1250.9 };

  it.each([undefined, '', null, '  Bloco A  '])('accepts description %p and persists a string', async (description) => {
    const dto = await pipe.transform({ ...base, ...(description === undefined ? {} : { description }) }, { type: 'body', metatype: CreateExpenseDto });
    const create = jest.fn().mockImplementation(({ data }) => Promise.resolve({ ...data, uuid: 'expense-1', status: 'pending', createdAt: new Date(), updatedAt: new Date() }));
    const service = new ExpensesService(
      { expense: { create } } as unknown as PrismaService,
      { assertCanEditWork: jest.fn().mockResolvedValue(undefined) } as unknown as GroupsService,
      { create: jest.fn().mockResolvedValue(undefined) } as unknown as WorkEventsService,
      { create: jest.fn().mockResolvedValue(undefined) } as unknown as NotificationsService,
    );
    await service.create('user-1', dto);
    expect(create).toHaveBeenCalledWith({ data: expect.objectContaining({ description: description?.trim() ?? '', amount: 1250.9 }) });
  });

  it('still rejects non-text descriptions', async () => {
    await expect(pipe.transform({ ...base, description: 123 }, { type: 'body', metatype: CreateExpenseDto })).rejects.toThrow();
  });
});
