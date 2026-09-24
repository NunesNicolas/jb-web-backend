import { Module } from '@nestjs/common';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PrismaModule } from '../../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { SharingModule } from '../sharing/sharing.module';
import { WorkEventsModule } from '../work-events/work-events.module';
import { WorksController } from './works.controller';
import { WorksService } from './works.service';

@Module({
  imports: [PrismaModule, SharingModule, WorkEventsModule, NotificationsModule],
  controllers: [WorksController],
  providers: [WorksService, JwtAuthGuard],
  exports: [WorksService],
})
export class WorksModule {}
