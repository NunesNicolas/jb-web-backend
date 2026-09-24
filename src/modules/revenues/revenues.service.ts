import { Injectable, NotFoundException } from '@nestjs/common';
import { Revenue as PrismaRevenue } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { WorkAccessLevel } from '../sharing/access-level.entity';
import { GroupsService } from '../sharing/groups.service';
import { WorkEventType } from '../work-events/work-event.entity';
import { WorkEventsService } from '../work-events/work-events.service';
import { CreateRevenueDto, RevenueResponseDto, UpdateRevenueDto } from './dto';
import { RevenueType } from './revenue.entity';

@Injectable()
export class RevenuesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly groupsService: GroupsService,
    private readonly workEventsService: WorkEventsService,
  ) {}

  async create(
    ownerUserUuid: string,
    createRevenueDto: CreateRevenueDto,
  ): Promise<RevenueResponseDto> {
    await this.groupsService.assertCanEditWork(
      ownerUserUuid,
      createRevenueDto.workUuid,
    );

    const revenue = await this.prisma.revenue.create({
      data: {
        ownerUserUuid,
        workUuid: createRevenueDto.workUuid,
        type: createRevenueDto.type,
        name: createRevenueDto.name.trim(),
        description: createRevenueDto.description?.trim() ?? '',
        amount: createRevenueDto.amount,
        receivedAt: new Date(createRevenueDto.receivedAt),
      },
    });

    await this.workEventsService.create({
      ownerUserUuid,
      workUuid: revenue.workUuid,
      type: WorkEventType.RevenueCreated,
      title: 'Receita registrada',
      description: revenue.name,
      metadata: { revenueUuid: revenue.uuid, amount: revenue.amount },
    });

    return this.toResponse(revenue);
  }

  async findAll(
    ownerUserUuid: string,
    workUuid?: string,
  ): Promise<RevenueResponseDto[]> {
    const revenues = await this.prisma.revenue.findMany({
      where: {
        work: this.accessibleWorkWhere(ownerUserUuid),
        ...(workUuid ? { workUuid } : {}),
      },
      orderBy: { receivedAt: 'desc' },
    });

    return revenues.map((revenue) => this.toResponse(revenue));
  }

  async update(
    ownerUserUuid: string,
    uuid: string,
    updateRevenueDto: UpdateRevenueDto,
  ): Promise<RevenueResponseDto> {
    const existingRevenue = await this.findEntityByUuid(ownerUserUuid, uuid);

    await this.groupsService.assertCanEditWork(
      ownerUserUuid,
      existingRevenue.workUuid,
    );

    const revenue = await this.prisma.revenue.update({
      where: { uuid },
      data: {
        ...(updateRevenueDto.type ? { type: updateRevenueDto.type } : {}),
        ...(updateRevenueDto.name ? { name: updateRevenueDto.name.trim() } : {}),
        ...(updateRevenueDto.description !== undefined
          ? { description: updateRevenueDto.description.trim() }
          : {}),
        ...(updateRevenueDto.amount !== undefined
          ? { amount: updateRevenueDto.amount }
          : {}),
        ...(updateRevenueDto.receivedAt
          ? { receivedAt: new Date(updateRevenueDto.receivedAt) }
          : {}),
      },
    });

    return this.toResponse(revenue);
  }

  async remove(ownerUserUuid: string, uuid: string): Promise<void> {
    const existingRevenue = await this.findEntityByUuid(ownerUserUuid, uuid);

    await this.groupsService.assertCanEditWork(
      ownerUserUuid,
      existingRevenue.workUuid,
    );

    await this.prisma.revenue.delete({ where: { uuid } });
  }

  private async findEntityByUuid(
    ownerUserUuid: string,
    uuid: string,
  ): Promise<PrismaRevenue> {
    const revenue = await this.prisma.revenue.findFirst({
      where: {
        uuid,
        work: this.accessibleWorkWhere(ownerUserUuid),
      },
    });

    if (!revenue) {
      throw new NotFoundException('Receita não encontrada.');
    }

    return revenue;
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

  private toResponse(revenue: PrismaRevenue): RevenueResponseDto {
    return {
      uuid: revenue.uuid,
      ownerUserUuid: revenue.ownerUserUuid,
      workUuid: revenue.workUuid,
      type: revenue.type as RevenueType,
      name: revenue.name,
      description: revenue.description,
      amount: revenue.amount,
      receivedAt: revenue.receivedAt,
      createdAt: revenue.createdAt,
      updatedAt: revenue.updatedAt,
    };
  }
}
