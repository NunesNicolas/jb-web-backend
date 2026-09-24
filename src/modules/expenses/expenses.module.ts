import { Module } from '@nestjs/common';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PrismaModule } from '../../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { SharingModule } from '../sharing/sharing.module';
import { WorkEventsModule } from '../work-events/work-events.module';
import { ExpensesController } from './expenses.controller';
import { ExpensesService } from './expenses.service';

@Module({
  imports: [PrismaModule, SharingModule, WorkEventsModule, NotificationsModule],
  controllers: [ExpensesController],
  providers: [ExpensesService, JwtAuthGuard],
  exports: [ExpensesService],
})
export class ExpensesModule {}
