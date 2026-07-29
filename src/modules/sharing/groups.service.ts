import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Group, Prisma, Work as PrismaWork } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { WorkStatus } from '../works/work.entity';
import { WorkAccessLevel } from './access-level.entity';
import {
  AddGroupMemberDto,
  CreateGroupDto,
  GroupResponseDto,
  UpdateGroupDto,
} from './dto';

type GroupWithRelations = Prisma.GroupGetPayload<{
  include: {
    members: { include: { user: true } };
    works: { include: { work: true } };
  };
}>;

@Injectable()
export class GroupsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    ownerUserUuid: string,
    createGroupDto: CreateGroupDto,
  ): Promise<GroupResponseDto> {
    const group = await this.prisma.$transaction(async (prisma) => {
      const createdGroup = await prisma.group.create({
        data: {
          ownerUserUuid,
          name: createGroupDto.name.trim(),
        },
      });

      await prisma.groupMember.create({
        data: {
          groupUuid: createdGroup.uuid,
          userUuid: ownerUserUuid,
          accessLevel: WorkAccessLevel.HeadModerator,
        },
      });

      return prisma.group.findUniqueOrThrow({
        where: { uuid: createdGroup.uuid },
        include: this.includeRelations(),
      });
    });

    return this.toResponse(group);
  }

  async findAll(userUuid: string): Promise<GroupResponseDto[]> {
    const groups = await this.prisma.group.findMany({
      where: {
        members: {
          some: { userUuid },
        },
      },
      include: this.includeRelations(),
      orderBy: { createdAt: 'desc' },
    });

    return groups.map((group) => this.toResponse(group));
  }

  async findOne(userUuid: string, uuid: string): Promise<GroupResponseDto> {
    const group = await this.findGroupForMember(userUuid, uuid);

    return this.toResponse(group);
  }

  async update(
    userUuid: string,
    uuid: string,
    updateGroupDto: UpdateGroupDto,
  ): Promise<GroupResponseDto> {
    await this.assertCanManageGroup(userUuid, uuid);

    await this.prisma.group.update({
      where: { uuid },
      data: {
        ...(updateGroupDto.name ? { name: updateGroupDto.name.trim() } : {}),
      },
    });

    return this.findOne(userUuid, uuid);
  }

  async remove(userUuid: string, uuid: string): Promise<void> {
    await this.assertCanManageGroup(userUuid, uuid);
    await this.prisma.group.delete({ where: { uuid } });
  }

  async linkWork(
    userUuid: string,
    groupUuid: string,
    workUuid: string,
  ): Promise<GroupResponseDto> {
    await this.assertCanManageGroup(userUuid, groupUuid);
    await this.assertCanShareWork(userUuid, workUuid);

    await this.prisma.groupWork.upsert({
      where: { groupUuid_workUuid: { groupUuid, workUuid } },
      create: { groupUuid, workUuid },
      update: {},
    });

    return this.findOne(userUuid, groupUuid);
  }

  async unlinkWork(
    userUuid: string,
    groupUuid: string,
    workUuid: string,
  ): Promise<GroupResponseDto> {
    await this.assertCanManageGroup(userUuid, groupUuid);

    await this.prisma.groupWork.deleteMany({
      where: { groupUuid, workUuid },
    });

    return this.findOne(userUuid, groupUuid);
  }

  async removeMember(
    userUuid: string,
    groupUuid: string,
    memberUuid: string,
  ): Promise<GroupResponseDto> {
    await this.assertCanManageGroup(userUuid, groupUuid);

    const member = await this.prisma.groupMember.findFirst({
      where: { uuid: memberUuid, groupUuid },
    });

    if (!member) {
      throw new NotFoundException('Membro nao encontrado.');
    }

    if (member.userUuid === userUuid) {
      throw new ForbiddenException('Voce nao pode remover a si mesmo.');
    }

    await this.prisma.groupMember.delete({ where: { uuid: memberUuid } });

    return this.findOne(userUuid, groupUuid);
  }

  async addMemberByEmail(
    userUuid: string,
    groupUuid: string,
    addGroupMemberDto: AddGroupMemberDto,
  ): Promise<GroupResponseDto> {
    await this.assertCanManageGroup(userUuid, groupUuid);

    const memberUser = await this.prisma.user.findUnique({
      where: { email: addGroupMemberDto.email.trim().toLowerCase() },
    });

    if (!memberUser) {
      throw new NotFoundException('Nenhum usuario cadastrado com este e-mail.');
    }

    const existingMember = await this.prisma.groupMember.findUnique({
      where: {
        groupUuid_userUuid: { groupUuid, userUuid: memberUser.uuid },
      },
    });

    if (existingMember) {
      throw new ConflictException('Este usuario ja participa do grupo.');
    }

    await this.prisma.groupMember.create({
      data: {
        groupUuid,
        userUuid: memberUser.uuid,
        accessLevel: addGroupMemberDto.accessLevel,
      },
    });

    return this.findOne(userUuid, groupUuid);
  }

  async assertCanManageGroup(userUuid: string, groupUuid: string) {
    const membership = await this.prisma.groupMember.findUnique({
      where: { groupUuid_userUuid: { groupUuid, userUuid } },
    });

    if (!membership) {
      throw new NotFoundException('Grupo nao encontrado.');
    }

    if (
      (membership.accessLevel as WorkAccessLevel) !==
      WorkAccessLevel.HeadModerator
    ) {
      throw new ForbiddenException('Voce nao pode gerenciar este grupo.');
    }
  }

  async assertCanShareWork(userUuid: string, workUuid: string) {
    const work = await this.prisma.work.findFirst({
      where: {
        uuid: workUuid,
        OR: [
          { ownerUserUuid: userUuid },
          {
            groupWorks: {
              some: {
                group: {
                  members: {
                    some: {
                      userUuid,
                      accessLevel: WorkAccessLevel.HeadModerator,
                    },
                  },
                },
              },
            },
          },
        ],
      },
    });

    if (!work) {
      throw new ForbiddenException('Voce nao pode compartilhar esta obra.');
    }
  }

  async assertCanEditWork(userUuid: string, workUuid: string) {
    const work = await this.findEditableWork(userUuid, workUuid);

    if (!work) {
      throw new ForbiddenException('Voce nao pode editar esta obra.');
    }
  }

  async findEditableWork(
    userUuid: string,
    workUuid: string,
  ): Promise<PrismaWork | null> {
    return this.prisma.work.findFirst({
      where: {
        uuid: workUuid,
        OR: [
          { ownerUserUuid: userUuid },
          {
            groupWorks: {
              some: {
                group: {
                  members: {
                    some: {
                      userUuid,
                      accessLevel: {
                        in: [
                          WorkAccessLevel.Contributor,
                          WorkAccessLevel.HeadModerator,
                        ],
                      },
                    },
                  },
                },
              },
            },
          },
        ],
      },
    });
  }

  private async findGroupForMember(
    userUuid: string,
    uuid: string,
  ): Promise<GroupWithRelations> {
    const group = await this.prisma.group.findFirst({
      where: {
        uuid,
        members: {
          some: { userUuid },
        },
      },
      include: this.includeRelations(),
    });

    if (!group) {
      throw new NotFoundException('Grupo nao encontrado.');
    }

    return group;
  }

  private includeRelations() {
    return {
      members: {
        include: { user: true },
        orderBy: { createdAt: 'asc' },
      },
      works: {
        include: { work: true },
        orderBy: { createdAt: 'desc' },
      },
    } satisfies Prisma.GroupInclude;
  }

  private toResponse(group: GroupWithRelations | Group): GroupResponseDto {
    const groupWithRelations = group as GroupWithRelations;

    return {
      uuid: group.uuid,
      ownerUserUuid: group.ownerUserUuid,
      name: group.name,
      members:
        groupWithRelations.members?.map((member) => ({
          uuid: member.uuid,
          userUuid: member.userUuid,
          name: member.user.name,
          email: member.user.email,
          accessLevel: member.accessLevel as WorkAccessLevel,
        })) ?? [],
      works:
        groupWithRelations.works?.map(({ work }) => ({
          uuid: work.uuid,
          name: work.name,
          address: work.address,
          status: work.status as WorkStatus,
        })) ?? [],
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
    };
  }
}
