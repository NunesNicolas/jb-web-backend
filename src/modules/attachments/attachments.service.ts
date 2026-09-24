import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Attachment as PrismaAttachment } from '@prisma/client';
import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import { extname, join } from 'path';

import { PrismaService } from '../../prisma/prisma.service';
import { WorkAccessLevel } from '../sharing/access-level.entity';
import { GroupsService } from '../sharing/groups.service';
import { WorkEventType } from '../work-events/work-event.entity';
import { WorkEventsService } from '../work-events/work-events.service';
import { AttachmentResponseDto, CreateAttachmentDto } from './dto';

const STORAGE_ROOT =
  process.env.ATTACHMENT_STORAGE_PATH ?? join(process.cwd(), 'storage');

@Injectable()
export class AttachmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly groupsService: GroupsService,
    private readonly workEventsService: WorkEventsService,
  ) {}

  async create(
    ownerUserUuid: string,
    createAttachmentDto: CreateAttachmentDto,
  ): Promise<AttachmentResponseDto> {
    if (createAttachmentDto.workUuid) {
      await this.groupsService.assertCanEditWork(
        ownerUserUuid,
        createAttachmentDto.workUuid,
      );
    }

    const parsed = this.parseDataUrl(createAttachmentDto.dataUrl);
    const extension =
      this.extensionFromMime(parsed.mimeType) ||
      extname(createAttachmentDto.originalName) ||
      '.bin';
    const filename = `${randomUUID()}${extension}`;
    const storagePath = join(STORAGE_ROOT, filename);

    await mkdir(STORAGE_ROOT, { recursive: true });
    await writeFile(storagePath, parsed.buffer);

    const attachment = await this.prisma.attachment.create({
      data: {
        ownerUserUuid,
        workUuid: createAttachmentDto.workUuid,
        filename,
        originalName: createAttachmentDto.originalName.trim(),
        mimeType: parsed.mimeType,
        size: parsed.buffer.length,
        storagePath,
        publicUrl: '',
      },
    });

    const publicUrl = `/api/attachments/${attachment.uuid}/content`;
    const updatedAttachment = await this.prisma.attachment.update({
      where: { uuid: attachment.uuid },
      data: { publicUrl },
    });

    if (createAttachmentDto.workUuid) {
      await this.workEventsService.create({
        ownerUserUuid,
        workUuid: createAttachmentDto.workUuid,
        type: WorkEventType.AttachmentUploaded,
        title: 'Anexo enviado',
        description: createAttachmentDto.originalName,
        metadata: {
          attachmentUuid: attachment.uuid,
          mimeType: parsed.mimeType,
          size: parsed.buffer.length,
        },
      });
    }

    return this.toResponse(updatedAttachment);
  }

  async findContent(ownerUserUuid: string, uuid: string): Promise<PrismaAttachment> {
    const attachment = await this.prisma.attachment.findFirst({
      where: {
        uuid,
        OR: [
          { ownerUserUuid },
          {
            work: {
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
                      },
                    },
                  },
                },
              ],
            },
          },
        ],
      },
    });

    if (!attachment) {
      throw new NotFoundException('Anexo não encontrado.');
    }

    return attachment;
  }

  private parseDataUrl(dataUrl: string) {
    const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);

    if (!match) {
      throw new BadRequestException('Arquivo inválido.');
    }

    return {
      mimeType: match[1],
      buffer: Buffer.from(match[2], 'base64'),
    };
  }

  private extensionFromMime(mimeType: string) {
    const extensions: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
      'image/gif': '.gif',
      'application/pdf': '.pdf',
    };

    return extensions[mimeType];
  }

  private toResponse(attachment: PrismaAttachment): AttachmentResponseDto {
    return {
      uuid: attachment.uuid,
      ownerUserUuid: attachment.ownerUserUuid,
      workUuid: attachment.workUuid,
      filename: attachment.filename,
      originalName: attachment.originalName,
      mimeType: attachment.mimeType,
      size: attachment.size,
      publicUrl: attachment.publicUrl,
      createdAt: attachment.createdAt,
    };
  }
}
