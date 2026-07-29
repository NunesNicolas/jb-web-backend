import { Injectable, NotFoundException } from '@nestjs/common';
import { Work as PrismaWork } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { WorkAccessLevel } from '../sharing/access-level.entity';
import { GroupsService } from '../sharing/groups.service';
import { CreateWorkDto, UpdateWorkDto, WorkResponseDto } from './dto';
import { WorkStatus } from './work.entity';

@Injectable()
export class WorksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly groupsService: GroupsService,
  ) {}

  async create(
    ownerUserUuid: string,
    createWorkDto: CreateWorkDto,
  ): Promise<WorkResponseDto> {
    const work = await this.prisma.work.create({
      data: {
        ownerUserUuid,
        name: createWorkDto.name.trim(),
        address: createWorkDto.address.trim(),
        longitude: createWorkDto.longitude,
        latitude: createWorkDto.latitude,
        estimatedPrice: createWorkDto.estimatedPrice,
        finalBudget: 0,
        status: createWorkDto.status,
      },
    });

    return this.toResponse(work);
  }

  async findAll(ownerUserUuid: string): Promise<WorkResponseDto[]> {
    const works = await this.prisma.work.findMany({
      where: this.accessibleWhere(ownerUserUuid),
      orderBy: { createdAt: 'desc' },
    });

    return works.map((work) => this.toResponse(work));
  }

  async findOne(ownerUserUuid: string, uuid: string): Promise<WorkResponseDto> {
    return this.toResponse(await this.findEntityByUuid(ownerUserUuid, uuid));
  }

  async update(
    ownerUserUuid: string,
    uuid: string,
    updateWorkDto: UpdateWorkDto,
  ): Promise<WorkResponseDto> {
    await this.groupsService.assertCanEditWork(ownerUserUuid, uuid);
    const data: Partial<{
      name: string;
      address: string;
      longitude: number;
      latitude: number;
      estimatedPrice: number;
      finalBudget: number;
      status: typeof updateWorkDto.status;
    }> = {};

    if (updateWorkDto.name) {
      data.name = updateWorkDto.name.trim();
    }

    if (updateWorkDto.address) {
      data.address = updateWorkDto.address.trim();
    }

    if (updateWorkDto.longitude !== undefined) {
      data.longitude = updateWorkDto.longitude;
    }

    if (updateWorkDto.latitude !== undefined) {
      data.latitude = updateWorkDto.latitude;
    }

    if (updateWorkDto.estimatedPrice !== undefined) {
      data.estimatedPrice = updateWorkDto.estimatedPrice;
    }

    if (updateWorkDto.finalBudget !== undefined) {
      data.finalBudget = updateWorkDto.finalBudget;
    }

    if (updateWorkDto.status) {
      data.status = updateWorkDto.status;
    }

    const work = await this.prisma.work.update({
      where: { uuid },
      data,
    });

    return this.toResponse(work);
  }

  async remove(ownerUserUuid: string, uuid: string): Promise<void> {
    await this.groupsService.assertCanShareWork(ownerUserUuid, uuid);
    await this.prisma.work.delete({ where: { uuid } });
  }

  private async findEntityByUuid(
    ownerUserUuid: string,
    uuid: string,
  ): Promise<PrismaWork> {
    const work = await this.prisma.work.findFirst({
      where: {
        uuid,
        ...this.accessibleWhere(ownerUserUuid),
      },
    });

    if (!work) {
      throw new NotFoundException('Obra nao encontrada.');
    }

    return work;
  }

  private accessibleWhere(ownerUserUuid: string) {
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

  private toResponse(work: PrismaWork): WorkResponseDto {
    return {
      uuid: work.uuid,
      ownerUserUuid: work.ownerUserUuid,
      name: work.name,
      address: work.address,
      longitude: work.longitude,
      latitude: work.latitude,
      estimatedPrice: work.estimatedPrice,
      finalBudget: work.finalBudget,
      status: work.status as WorkStatus,
      createdAt: work.createdAt,
      updatedAt: work.updatedAt,
    };
  }
}
