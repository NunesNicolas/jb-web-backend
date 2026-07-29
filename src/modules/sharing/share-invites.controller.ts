import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../../common/interfaces/authenticated-request.interface';
import { CreateShareInviteDto, ShareInviteResponseDto } from './dto';
import { ShareInvitesService } from './share-invites.service';

@ApiTags('share-invites')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('share-invites')
export class ShareInvitesController {
  constructor(private readonly shareInvitesService: ShareInvitesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar convite unico de compartilhamento de obra' })
  @ApiCreatedResponse({ type: ShareInviteResponseDto })
  create(
    @Req() request: AuthenticatedRequest,
    @Body() createShareInviteDto: CreateShareInviteDto,
  ): Promise<ShareInviteResponseDto> {
    return this.shareInvitesService.create(
      request.user.sub,
      createShareInviteDto,
    );
  }

  @Get(':token')
  @ApiOperation({ summary: 'Visualizar convite pendente pelo token' })
  @ApiOkResponse({ type: ShareInviteResponseDto })
  findByToken(@Param('token') token: string): Promise<ShareInviteResponseDto> {
    return this.shareInvitesService.findByToken(token);
  }

  @Post(':token/accept')
  @ApiOperation({ summary: 'Aceitar convite unico de compartilhamento' })
  @ApiOkResponse({ type: ShareInviteResponseDto })
  accept(
    @Req() request: AuthenticatedRequest,
    @Param('token') token: string,
  ): Promise<ShareInviteResponseDto> {
    return this.shareInvitesService.accept(token, request.user.sub);
  }
}
