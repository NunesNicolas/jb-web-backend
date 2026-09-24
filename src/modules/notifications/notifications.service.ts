import { Injectable } from '@nestjs/common';
import { Notification as PrismaNotification } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { NotificationResponseDto } from './dto';
import { NotificationType } from './notification.entity';

type CreateNotificationInput = {
  ownerUserUuid: string;
  workUuid?: string | null;
  type: NotificationType;
  title: string;
  description?: string;
};

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateNotificationInput): Promise<NotificationResponseDto> {
    const notification = await this.prisma.notification.create({
      data: {
        ownerUserUuid: input.ownerUserUuid,
        workUuid: input.workUuid,
        type: input.type,
        title: input.title,
        description: input.description ?? '',
      },
    });

    return this.toResponse(notification);
  }

  async findAll(ownerUserUuid: string): Promise<NotificationResponseDto[]> {
    await this.createDueTaskNotifications(ownerUserUuid);

    const notifications = await this.prisma.notification.findMany({
      where: { ownerUserUuid },
      orderBy: { createdAt: 'desc' },
      take: 60,
    });

    return notifications.map((notification) => this.toResponse(notification));
  }

  async markRead(
    ownerUserUuid: string,
    uuid: string,
  ): Promise<NotificationResponseDto> {
    const notification = await this.prisma.notification.update({
      where: { uuid, ownerUserUuid },
      data: { readAt: new Date() },
    });

    return this.toResponse(notification);
  }

  private async createDueTaskNotifications(ownerUserUuid: string) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const tasks = await this.prisma.task.findMany({
      where: {
        ownerUserUuid,
        dueDate: { lte: tomorrow },
        status: { not: 'done' },
      },
      take: 20,
    });

    for (const task of tasks) {
      const existingNotification = await this.prisma.notification.findFirst({
        where: {
          ownerUserUuid,
          type: NotificationType.TaskDue,
          title: `Prazo próximo: ${task.title}`,
          readAt: null,
        },
      });

      if (!existingNotification) {
        await this.create({
          ownerUserUuid,
          workUuid: task.workUuid,
          type: NotificationType.TaskDue,
          title: `Prazo próximo: ${task.title}`,
          description: task.dueDate
            ? `Vence em ${task.dueDate.toISOString().slice(0, 10)}.`
            : '',
        });
      }
    }
  }

  private toResponse(
    notification: PrismaNotification,
  ): NotificationResponseDto {
    return {
      uuid: notification.uuid,
      ownerUserUuid: notification.ownerUserUuid,
      workUuid: notification.workUuid,
      type: notification.type as NotificationType,
      title: notification.title,
      description: notification.description,
      readAt: notification.readAt,
      createdAt: notification.createdAt,
    };
  }
}
