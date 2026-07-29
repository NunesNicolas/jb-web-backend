import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../../common/interfaces/authenticated-request.interface';
import {
  AddGroupMemberDto,
  CreateGroupDto,
  GroupResponseDto,
  LinkWorkToGroupDto,
  UpdateGroupDto,
} from './dto';
import { GroupsService } from './groups.service';

@ApiTags('groups')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar grupo de compartilhamento' })
  @ApiCreatedResponse({ type: GroupResponseDto })
  create(
    @Req() request: AuthenticatedRequest,
    @Body() createGroupDto: CreateGroupDto,
  ): Promise<GroupResponseDto> {
    return this.groupsService.create(request.user.sub, createGroupDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar grupos do usuario autenticado' })
  @ApiOkResponse({ type: GroupResponseDto, isArray: true })
  findAll(@Req() request: AuthenticatedRequest): Promise<GroupResponseDto[]> {
    return this.groupsService.findAll(request.user.sub);
  }

  @Get(':uuid')
  @ApiOperation({ summary: 'Buscar grupo por UUID' })
  @ApiOkResponse({ type: GroupResponseDto })
  findOne(
    @Req() request: AuthenticatedRequest,
    @Param('uuid') uuid: string,
  ): Promise<GroupResponseDto> {
    return this.groupsService.findOne(request.user.sub, uuid);
  }

  @Patch(':uuid')
  @ApiOperation({ summary: 'Atualizar grupo por UUID' })
  @ApiOkResponse({ type: GroupResponseDto })
  update(
    @Req() request: AuthenticatedRequest,
    @Param('uuid') uuid: string,
    @Body() updateGroupDto: UpdateGroupDto,
  ): Promise<GroupResponseDto> {
    return this.groupsService.update(request.user.sub, uuid, updateGroupDto);
  }

  @Delete(':uuid')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover grupo por UUID' })
  @ApiNoContentResponse()
  remove(
    @Req() request: AuthenticatedRequest,
    @Param('uuid') uuid: string,
  ): Promise<void> {
    return this.groupsService.remove(request.user.sub, uuid);
  }

  @Post(':uuid/works')
  @ApiOperation({ summary: 'Liberar obra para um grupo' })
  @ApiOkResponse({ type: GroupResponseDto })
  linkWork(
    @Req() request: AuthenticatedRequest,
    @Param('uuid') uuid: string,
    @Body() linkWorkToGroupDto: LinkWorkToGroupDto,
  ): Promise<GroupResponseDto> {
    return this.groupsService.linkWork(
      request.user.sub,
      uuid,
      linkWorkToGroupDto.workUuid,
    );
  }

  @Delete(':uuid/works/:workUuid')
  @ApiOperation({ summary: 'Remover obra de um grupo' })
  @ApiOkResponse({ type: GroupResponseDto })
  unlinkWork(
    @Req() request: AuthenticatedRequest,
    @Param('uuid') uuid: string,
    @Param('workUuid') workUuid: string,
  ): Promise<GroupResponseDto> {
    return this.groupsService.unlinkWork(request.user.sub, uuid, workUuid);
  }

  @Delete(':uuid/members/:memberUuid')
  @ApiOperation({ summary: 'Remover membro de um grupo' })
  @ApiOkResponse({ type: GroupResponseDto })
  removeMember(
    @Req() request: AuthenticatedRequest,
    @Param('uuid') uuid: string,
    @Param('memberUuid') memberUuid: string,
  ): Promise<GroupResponseDto> {
    return this.groupsService.removeMember(request.user.sub, uuid, memberUuid);
  }

  @Post(':uuid/members')
  @ApiOperation({ summary: 'Adicionar usuario ao grupo pelo e-mail' })
  @ApiOkResponse({ type: GroupResponseDto })
  addMember(
    @Req() request: AuthenticatedRequest,
    @Param('uuid') uuid: string,
    @Body() addGroupMemberDto: AddGroupMemberDto,
  ): Promise<GroupResponseDto> {
    return this.groupsService.addMemberByEmail(
      request.user.sub,
      uuid,
      addGroupMemberDto,
    );
  }
}
