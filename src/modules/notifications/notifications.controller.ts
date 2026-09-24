import { Controller, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../../common/interfaces/authenticated-request.interface';
import { NotificationResponseDto } from './dto';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar notificações' })
  @ApiOkResponse({ type: NotificationResponseDto, isArray: true })
  findAll(
    @Req() request: AuthenticatedRequest,
  ): Promise<NotificationResponseDto[]> {
    return this.notificationsService.findAll(request.user.sub);
  }

  @Patch(':uuid/read')
  @ApiOperation({ summary: 'Marcar notificação como lida' })
  @ApiOkResponse({ type: NotificationResponseDto })
  markRead(
    @Req() request: AuthenticatedRequest,
    @Param('uuid') uuid: string,
  ): Promise<NotificationResponseDto> {
    return this.notificationsService.markRead(request.user.sub, uuid);
  }
}
