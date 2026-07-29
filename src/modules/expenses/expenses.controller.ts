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
import { CreateExpenseDto, ExpenseResponseDto, UpdateExpenseDto } from './dto';
import { ExpensesService } from './expenses.service';

@ApiTags('expenses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar despesa' })
  @ApiCreatedResponse({ type: ExpenseResponseDto })
  create(
    @Req() request: AuthenticatedRequest,
    @Body() createExpenseDto: CreateExpenseDto,
  ): Promise<ExpenseResponseDto> {
    return this.expensesService.create(request.user.sub, createExpenseDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar despesas' })
  @ApiOkResponse({ type: ExpenseResponseDto, isArray: true })
  findAll(
    @Req() request: AuthenticatedRequest,
    @Query('workUuid') workUuid?: string,
  ): Promise<ExpenseResponseDto[]> {
    return this.expensesService.findAll(request.user.sub, workUuid);
  }

  @Get(':uuid')
  @ApiOperation({ summary: 'Buscar despesa por UUID' })
  @ApiOkResponse({ type: ExpenseResponseDto })
  findOne(
    @Req() request: AuthenticatedRequest,
    @Param('uuid') uuid: string,
  ): Promise<ExpenseResponseDto> {
    return this.expensesService.findOne(request.user.sub, uuid);
  }

  @Patch(':uuid')
  @ApiOperation({ summary: 'Atualizar despesa por UUID' })
  @ApiOkResponse({ type: ExpenseResponseDto })
  update(
    @Req() request: AuthenticatedRequest,
    @Param('uuid') uuid: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
  ): Promise<ExpenseResponseDto> {
    return this.expensesService.update(
      request.user.sub,
      uuid,
      updateExpenseDto,
    );
  }

  @Delete(':uuid')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover despesa por UUID' })
  @ApiNoContentResponse()
  remove(
    @Req() request: AuthenticatedRequest,
    @Param('uuid') uuid: string,
  ): Promise<void> {
    return this.expensesService.remove(request.user.sub, uuid);
  }
}
