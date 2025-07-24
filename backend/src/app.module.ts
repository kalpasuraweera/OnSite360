import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ProjectsModule } from './projects/projects.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { PermissionsModule } from './permissions/permissions.module';
import { RolesModule } from './roles/roles.module';
import { CommunicationModule } from './communication/communication.module';
import { ScheduleModule } from './schedule/schedule.module';
import { TasksModule } from './tasks/tasks.module';
import { DocumentsModule } from './documents/documents.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { CopilotModule } from './copilot/copilot.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../../uploads'),
      serveRoot: '/uploads',
    }),
    AuthModule,
    UsersModule,
    ProjectsModule,
    PrismaModule,
    PermissionsModule,
    RolesModule,
    CommunicationModule,
    ScheduleModule,
    TasksModule,
    DocumentsModule,
    CopilotModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
