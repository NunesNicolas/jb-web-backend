import { Module } from '@nestjs/common';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PrismaModule } from '../../prisma/prisma.module';
import { SharingModule } from '../sharing/sharing.module';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

@Module({
  imports: [PrismaModule, SharingModule],
  controllers: [TasksController],
  providers: [TasksService, JwtAuthGuard],
  exports: [TasksService],
})
export class TasksModule {}
