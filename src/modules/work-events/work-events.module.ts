import { Module } from '@nestjs/common';

import { PrismaModule } from '../../prisma/prisma.module';
import { WorkEventsController } from './work-events.controller';
import { WorkEventsService } from './work-events.service';

@Module({
  imports: [PrismaModule],
  controllers: [WorkEventsController],
  providers: [WorkEventsService],
  exports: [WorkEventsService],
})
export class WorkEventsModule {}
