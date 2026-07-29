import { Module } from '@nestjs/common';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PrismaModule } from '../../prisma/prisma.module';
import { SharingModule } from '../sharing/sharing.module';
import { WorksController } from './works.controller';
import { WorksService } from './works.service';

@Module({
  imports: [PrismaModule, SharingModule],
  controllers: [WorksController],
  providers: [WorksService, JwtAuthGuard],
  exports: [WorksService],
})
export class WorksModule {}
