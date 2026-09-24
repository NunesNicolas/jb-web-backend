import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../../common/interfaces/authenticated-request.interface';
import { WorkEventResponseDto } from './dto';
import { WorkEventsService } from './work-events.service';

@ApiTags('work-events')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('work-events')
export class WorkEventsController {
  constructor(private readonly workEventsService: WorkEventsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar histórico das obras' })
  @ApiOkResponse({ type: WorkEventResponseDto, isArray: true })
  findAll(
    @Req() request: AuthenticatedRequest,
    @Query('workUuid') workUuid?: string,
  ): Promise<WorkEventResponseDto[]> {
    return this.workEventsService.findAll(request.user.sub, workUuid);
  }
}
