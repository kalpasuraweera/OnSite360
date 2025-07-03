import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProjectDto: CreateProjectDto) {
    const { name, budget, startDate, endDate, manager, location, description } =
      createProjectDto;
    return this.prisma.project.create({
      data: {
        name,
        budget,
        location,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        description,
        userProjects: {
          create: manager
            ? {
                userId: manager,
                projectRole: 'Task Manager',
                accessLevel: 2,
                isActive: true,
              }
            : undefined,
        },
      },
    });
  }

  async findAll() {
    return this.prisma.project.findMany();
  }

  findOne(id: number) {
    return `This action returns a #${id} project`;
  }

  update(id: number, updateProjectDto: UpdateProjectDto) {
    return `This action updates a #${id} project`;
  }

  remove(id: number) {
    return `This action removes a #${id} project`;
  }
}
