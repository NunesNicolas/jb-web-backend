import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../../common/interfaces/authenticated-request.interface';
import { AttachmentResponseDto, CreateAttachmentDto } from './dto';
import { AttachmentsService } from './attachments.service';

@ApiTags('attachments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('attachments')
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Enviar anexo' })
  @ApiCreatedResponse({ type: AttachmentResponseDto })
  create(
    @Req() request: AuthenticatedRequest,
    @Body() createAttachmentDto: CreateAttachmentDto,
  ): Promise<AttachmentResponseDto> {
    return this.attachmentsService.create(request.user.sub, createAttachmentDto);
  }

  @Get(':uuid/content')
  @ApiOperation({ summary: 'Baixar conteúdo do anexo' })
  async content(
    @Req() request: AuthenticatedRequest,
    @Param('uuid') uuid: string,
    @Res() response: Response,
  ) {
    const attachment = await this.attachmentsService.findContent(
      request.user.sub,
      uuid,
    );

    response.type(attachment.mimeType);
    response.sendFile(attachment.storagePath);
  }
}
