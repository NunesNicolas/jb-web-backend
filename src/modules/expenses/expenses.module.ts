import { Module } from '@nestjs/common';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PrismaModule } from '../../prisma/prisma.module';
import { SharingModule } from '../sharing/sharing.module';
import { ExpensesController } from './expenses.controller';
import { ExpensesService } from './expenses.service';

@Module({
  imports: [PrismaModule, SharingModule],
  controllers: [ExpensesController],
  providers: [ExpensesService, JwtAuthGuard],
  exports: [ExpensesService],
})
export class ExpensesModule {}
