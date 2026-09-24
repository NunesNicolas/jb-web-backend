import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomBytes } from 'crypto';

import { PrismaService } from '../../prisma/prisma.service';
import { ShareInviteStatus, WorkAccessLevel } from './access-level.entity';
import { CreateShareInviteDto, ShareInviteResponseDto } from './dto';
import { GroupsService } from './groups.service';

type InviteWithRelations = Prisma.WorkShareInviteGetPayload<{
  include: { group: true; work: true };
}>;

@Injectable()
export class ShareInvitesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly groupsService: GroupsService,
  ) {}

  async create(
    createdByUuid: string,
    createShareInviteDto: CreateShareInviteDto,
  ): Promise<ShareInviteResponseDto> {
    await this.groupsService.assertCanManageGroup(
      createdByUuid,
      createShareInviteDto.groupUuid,
    );
    await this.groupsService.assertCanShareWork(
      createdByUuid,
      createShareInviteDto.workUuid,
    );

    await this.prisma.groupWork.upsert({
      where: {
        groupUuid_workUuid: {
          groupUuid: createShareInviteDto.groupUuid,
          workUuid: createShareInviteDto.workUuid,
        },
      },
      create: {
        groupUuid: createShareInviteDto.groupUuid,
        workUuid: createShareInviteDto.workUuid,
      },
      update: {},
    });

    const invite = await this.prisma.workShareInvite.create({
      data: {
        token: this.createToken(),
        groupUuid: createShareInviteDto.groupUuid,
        workUuid: createShareInviteDto.workUuid,
        createdByUuid,
        accessLevel: createShareInviteDto.accessLevel,
      },
      include: this.includeRelations(),
    });

    return this.toResponse(invite);
  }

  async findByToken(token: string): Promise<ShareInviteResponseDto> {
    return this.toResponse(await this.findPendingInvite(token));
  }

  async accept(
    token: string,
    userUuid: string,
  ): Promise<ShareInviteResponseDto> {
    const invite = await this.findPendingInvite(token);

    const acceptedInvite = await this.prisma.$transaction(async (prisma) => {
      await prisma.groupWork.upsert({
        where: {
          groupUuid_workUuid: {
            groupUuid: invite.groupUuid,
            workUuid: invite.workUuid,
          },
        },
        create: {
          groupUuid: invite.groupUuid,
          workUuid: invite.workUuid,
        },
        update: {},
      });

      const member = await prisma.groupMember.upsert({
        where: {
          groupUuid_userUuid: {
            groupUuid: invite.groupUuid,
            userUuid,
          },
        },
        create: {
          groupUuid: invite.groupUuid,
          userUuid,
          accessLevel: invite.accessLevel,
        },
        update: {
          accessLevel: invite.accessLevel,
        },
      });

      await prisma.groupMemberWork.upsert({
        where: {
          memberUuid_workUuid: {
            memberUuid: member.uuid,
            workUuid: invite.workUuid,
          },
        },
        create: {
          memberUuid: member.uuid,
          workUuid: invite.workUuid,
        },
        update: {},
      });

      return prisma.workShareInvite.update({
        where: { uuid: invite.uuid },
        data: {
          status: ShareInviteStatus.Accepted,
          acceptedByUuid: userUuid,
          acceptedAt: new Date(),
        },
        include: this.includeRelations(),
      });
    });

    return this.toResponse(acceptedInvite);
  }

  private async findPendingInvite(token: string): Promise<InviteWithRelations> {
    const invite = await this.prisma.workShareInvite.findUnique({
      where: { token },
      include: this.includeRelations(),
    });

    if (!invite) {
      throw new NotFoundException('Convite não encontrado.');
    }

    if ((invite.status as ShareInviteStatus) !== ShareInviteStatus.Pending) {
      throw new ConflictException('Este convite já foi utilizado.');
    }

    return invite;
  }

  private createToken(): string {
    return randomBytes(24).toString('hex');
  }

  private includeRelations() {
    return { group: true, work: true } satisfies Prisma.WorkShareInviteInclude;
  }

  private toResponse(invite: InviteWithRelations): ShareInviteResponseDto {
    return {
      uuid: invite.uuid,
      token: invite.token,
      groupUuid: invite.groupUuid,
      groupName: invite.group.name,
      workUuid: invite.workUuid,
      workName: invite.work.name,
      accessLevel: invite.accessLevel as WorkAccessLevel,
      status: invite.status as ShareInviteStatus,
      createdAt: invite.createdAt,
    };
  }
}
