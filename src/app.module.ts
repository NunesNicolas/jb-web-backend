import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { UsersModule } from './modules/users/users.module';
import { WorksModule } from './modules/works/works.module';
import { SharingModule } from './modules/sharing/sharing.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    WorksModule,
    ExpensesModule,
    SharingModule,
    TasksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
