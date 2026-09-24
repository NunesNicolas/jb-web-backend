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
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../../common/interfaces/authenticated-request.interface';
import { CreateRevenueDto, RevenueResponseDto, UpdateRevenueDto } from './dto';
import { RevenuesService } from './revenues.service';

@ApiTags('revenues')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('revenues')
export class RevenuesController {
  constructor(private readonly revenuesService: RevenuesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar venda/aluguel' })
  @ApiCreatedResponse({ type: RevenueResponseDto })
  create(
    @Req() request: AuthenticatedRequest,
    @Body() createRevenueDto: CreateRevenueDto,
  ): Promise<RevenueResponseDto> {
    return this.revenuesService.create(request.user.sub, createRevenueDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar vendas/alugueis' })
  @ApiOkResponse({ type: RevenueResponseDto, isArray: true })
  findAll(
    @Req() request: AuthenticatedRequest,
    @Query('workUuid') workUuid?: string,
  ): Promise<RevenueResponseDto[]> {
    return this.revenuesService.findAll(request.user.sub, workUuid);
  }

  @Patch(':uuid')
  @ApiOperation({ summary: 'Atualizar venda/aluguel' })
  @ApiOkResponse({ type: RevenueResponseDto })
  update(
    @Req() request: AuthenticatedRequest,
    @Param('uuid') uuid: string,
    @Body() updateRevenueDto: UpdateRevenueDto,
  ): Promise<RevenueResponseDto> {
    return this.revenuesService.update(request.user.sub, uuid, updateRevenueDto);
  }

  @Delete(':uuid')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover venda/aluguel' })
  @ApiNoContentResponse()
  remove(
    @Req() request: AuthenticatedRequest,
    @Param('uuid') uuid: string,
  ): Promise<void> {
    return this.revenuesService.remove(request.user.sub, uuid);
  }
}
