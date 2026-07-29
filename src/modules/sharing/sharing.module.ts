import { Module } from '@nestjs/common';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PrismaModule } from '../../prisma/prisma.module';
import { GroupsController } from './groups.controller';
import { GroupsService } from './groups.service';
import { ShareInvitesController } from './share-invites.controller';
import { ShareInvitesService } from './share-invites.service';

@Module({
  imports: [PrismaModule],
  controllers: [GroupsController, ShareInvitesController],
  providers: [GroupsService, ShareInvitesService, JwtAuthGuard],
  exports: [GroupsService],
})
export class SharingModule {}
