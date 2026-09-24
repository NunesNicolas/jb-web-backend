import { Module } from '@nestjs/common';

import { PrismaModule } from '../../prisma/prisma.module';
import { SharingModule } from '../sharing/sharing.module';
import { WorkEventsModule } from '../work-events/work-events.module';
import { RevenuesController } from './revenues.controller';
import { RevenuesService } from './revenues.service';

@Module({
  imports: [PrismaModule, SharingModule, WorkEventsModule],
  controllers: [RevenuesController],
  providers: [RevenuesService],
  exports: [RevenuesService],
})
export class RevenuesModule {}
