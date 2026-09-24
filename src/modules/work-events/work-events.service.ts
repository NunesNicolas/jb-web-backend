import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Prisma, WorkEvent as PrismaWorkEvent } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { WorkAccessLevel } from '../sharing/access-level.entity';
import { WorkEventResponseDto } from './dto';
import { WorkEventType } from './work-event.entity';

type CreateWorkEventInput = {
  ownerUserUuid: string;
  workUuid: string;
  type: WorkEventType;
  title: string;
  description?: string;
  metadata?: Prisma.InputJsonValue;
};

@Injectable()
export class WorkEventsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(WorkEventsService.name);
  private readonly retentionMonths = 3;
  private readonly cleanupIntervalMs = 24 * 60 * 60 * 1000;
  private cleanupTimer?: NodeJS.Timeout;
  private isCleaningUp = false;

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    void this.cleanupExpiredEvents();

    this.cleanupTimer = setInterval(() => {
      void this.cleanupExpiredEvents();
    }, this.cleanupIntervalMs);
    this.cleanupTimer.unref?.();
  }

  onModuleDestroy() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
  }

  async create(input: CreateWorkEventInput): Promise<WorkEventResponseDto> {
    const event = await this.prisma.workEvent.create({
      data: {
        ownerUserUuid: input.ownerUserUuid,
        workUuid: input.workUuid,
        type: input.type,
        title: input.title,
        description: input.description ?? '',
        metadata: input.metadata,
      },
    });

    return this.toResponse(event);
  }

  async findAll(
    ownerUserUuid: string,
    workUuid?: string,
  ): Promise<WorkEventResponseDto[]> {
    const events = await this.prisma.workEvent.findMany({
      where: {
        work: this.accessibleWorkWhere(ownerUserUuid),
        ...(workUuid ? { workUuid } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 120,
    });

    return events.map((event) => this.toResponse(event));
  }

  async cleanupExpiredEvents(now = new Date()): Promise<number> {
    if (this.isCleaningUp) {
      return 0;
    }

    this.isCleaningUp = true;

    try {
      const cutoffDate = this.getRetentionCutoffDate(now);
      const { count } = await this.prisma.workEvent.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate,
          },
        },
      });

      if (count > 0) {
        this.logger.log(
          `Removed ${count} work events older than ${this.retentionMonths} months.`,
        );
      }

      return count;
    } finally {
      this.isCleaningUp = false;
    }
  }

  private getRetentionCutoffDate(now: Date): Date {
    const cutoffDate = new Date(now);
    cutoffDate.setMonth(cutoffDate.getMonth() - this.retentionMonths);

    return cutoffDate;
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

  private toResponse(event: PrismaWorkEvent): WorkEventResponseDto {
    return {
      uuid: event.uuid,
      ownerUserUuid: event.ownerUserUuid,
      workUuid: event.workUuid,
      type: event.type as WorkEventType,
      title: event.title,
      description: event.description,
      metadata: event.metadata,
      createdAt: event.createdAt,
    };
  }
}
