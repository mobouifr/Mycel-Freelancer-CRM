import os
import re

base_dir = '/home/souita/Desktop/freelancer-crm-final-project/backend/OthmaneEr-Refaly/src/projects/'

# 1. Update projects.module.ts
mod_path = base_dir + 'projects.module.ts'
with open(mod_path, 'r') as f:
    mod_code = f.read()

mod_code = mod_code.replace("import { GamificationModule } from '../gamification/gamification.module';", "import { GamificationModule } from '../gamification/gamification.module';\nimport { PrismaModule } from '../prisma/prisma.module';")
mod_code = mod_code.replace("imports: [GamificationModule],", "imports: [GamificationModule, PrismaModule],")
with open(mod_path, 'w') as f:
    f.write(mod_code)

# 2. Update projects.controller.ts
ctrl_path = base_dir + 'projects.controller.ts'
with open(ctrl_path, 'r') as f:
    ctrl_code = f.read()

ctrl_code = re.sub(r'(@Post\(\)\n\s+)?create\(.*\) {', r'\1async create(@Body() createProjectDto: CreateProjectDto) {', ctrl_code)
ctrl_code = re.sub(r'return this.projectsService.create\(createProjectDto\);', 'return await this.projectsService.create(createProjectDto);', ctrl_code)
ctrl_code = re.sub(r'(@Get\(\)\n\s+)?findAll\(\) {', r'\1async findAll() {', ctrl_code)
ctrl_code = re.sub(r'return this.projectsService.findAll\(\);', 'return await this.projectsService.findAll();', ctrl_code)
ctrl_code = re.sub(r'(@Get\(\':id\'\)\n\s+)?findOne\(@Param\(\'id\'\) id: string\) {', r'\1async findOne(@Param(\'id\') id: string) {', ctrl_code)
ctrl_code = re.sub(r'return this.projectsService.findOne\((\+?)id\);', r'return await this.projectsService.findOne(id);', ctrl_code)
ctrl_code = re.sub(r'(@Patch\(\':id\'\)\n\s+)?update\(@Param\(\'id\'\) id: string.*\) {', r'\1async update(@Param(\'id\') id: string, @Body() updateProjectDto: UpdateProjectDto) {', ctrl_code)
ctrl_code = re.sub(r'return this.projectsService.update\((\+?)id, updateProjectDto\);', r'return await this.projectsService.update(id, updateProjectDto);', ctrl_code)
ctrl_code = re.sub(r'(@Delete\(\':id\'\)\n\s+)?remove\(@Param\(\'id\'\) id: string\) {', r'\1async remove(@Param(\'id\') id: string) {', ctrl_code)
ctrl_code = re.sub(r'return this.projectsService.remove\((\+?)id\);', r'return await this.projectsService.remove(id);', ctrl_code)

with open(ctrl_path, 'w') as f:
    f.write(ctrl_code)

# 3. Update projects.service.ts
svc_path = base_dir + 'projects.service.ts'
svc_code = """import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { GamificationService } from '../gamification/gamification.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly gamificationService: GamificationService,
    private readonly prisma: PrismaService
  ) {}

  async create(createProjectDto: CreateProjectDto | any) {
    const data: any = {
      title: createProjectDto.title || '',
      description: createProjectDto.description || '',
      status: createProjectDto.status || 'ACTIVE',
      budget: createProjectDto.budget !== undefined ? createProjectDto.budget : 0,
    };
    if (createProjectDto.due_date) {
        data.deadline = new Date(createProjectDto.due_date);
    }
    return await this.prisma.project.create({ data });
  }

  async findAll() {
    return await this.prisma.project.findMany();
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto | any) {
    const existingProject = await this.prisma.project.findUnique({ where: { id } });
    if (!existingProject) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    const oldStatus = existingProject.status;

    const data: any = {
      ...updateProjectDto
    };
    if (updateProjectDto.due_date) {
        data.deadline = new Date(updateProjectDto.due_date);
        delete data.due_date;
    }

    const updatedProject = await this.prisma.project.update({
      where: { id },
      data
    });

    const newStatus = updatedProject.status;

    if (oldStatus !== 'completed' && newStatus === 'completed') {
      const userid = updateProjectDto.userid || 'uuid-user';
      const priority = updateProjectDto.priority || 'medium';
      
      this.gamificationService.awardProjectCompletionXp(
        userid,
        updatedProject.budget,
        priority
      );
    }

    return updatedProject;
  }

  async remove(id: string) {
    const existingProject = await this.prisma.project.findUnique({ where: { id } });
    if (!existingProject) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    return await this.prisma.project.delete({ where: { id } });
  }
}
"""

svc_code = svc_code.replace("Project with ID ${id} not found", "`Project with ID ${id} not found`")

with open(svc_path, 'w') as f:
    f.write(svc_code)

# 4. Update spec files
ctrl_spec_path = base_dir + 'projects.controller.spec.ts'
with open(ctrl_spec_path, 'r') as f:
    ctrl_spec_code = f.read()

ctrl_spec_code = re.sub(r'create\((.*)', r'await create\1', ctrl_spec_code)
ctrl_spec_code = re.sub(r'findAll\((.*)', r'await findAll\1', ctrl_spec_code)
ctrl_spec_code = re.sub(r'findOne\((.*)', r'await findOne\1', ctrl_spec_code)
ctrl_spec_code = re.sub(r'update\((.*)', r'await update\1', ctrl_spec_code)
ctrl_spec_code = re.sub(r'remove\((.*)', r'await remove\1', ctrl_spec_code)
ctrl_spec_code = re.sub(r"\'1\'", r"'uuid-1'", ctrl_spec_code)

with open(ctrl_spec_path, 'w') as f:
    f.write(ctrl_spec_code)


svc_spec_path = base_dir + 'projects.service.spec.ts'

svc_spec_code = """import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from './projects.service';
import { PrismaService } from '../prisma/prisma.service';
import { GamificationService } from '../gamification/gamification.service';
import { NotFoundException } from '@nestjs/common';

const mockPrismaService = {
  project: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

const mockGamificationService = {
  awardProjectCompletionXp: jest.fn(),
};

describe('ProjectsService', () => {
  let service: ProjectsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: GamificationService,
          useValue: mockGamificationService,
        },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a new project', async () => {
    const createProjectDto = { title: 'Test Project', budget: 1000 };
    const mockOutput = { id: 'uuid-1', ...createProjectDto };
    
    mockPrismaService.project.create.mockResolvedValue(mockOutput);
    
    const result = await service.create(createProjectDto as any);
    expect(result).toMatchObject(mockOutput);
    expect(prisma.project.create).toHaveBeenCalled();
  });

  it('should return all projects', async () => {
    const mockArray = [{ id: 'uuid-1', title: 'P 1' }, { id: 'uuid-2', title: 'P 2' }];
    mockPrismaService.project.findMany.mockResolvedValue(mockArray);

    const result = await service.findAll();
    expect(result).toEqual(mockArray);
    expect(prisma.project.findMany).toHaveBeenCalled();
  });

  it('should find a project by ID', async () => {
    const mockProject = { id: 'uuid-1', title: 'Find Me' };
    mockPrismaService.project.findUnique.mockResolvedValue(mockProject);

    const result = await service.findOne('uuid-1');
    expect(result).toEqual(mockProject);
    expect(prisma.project.findUnique).toHaveBeenCalledWith({ where: { id: 'uuid-1' } });
  });

  it('should throw NotFoundException if project does not exist', async () => {
    mockPrismaService.project.findUnique.mockResolvedValue(null);
    await expect(service.findOne('uuid-999')).rejects.toThrow(NotFoundException);
  });

  it('should remove a project', async () => {
    const mockProject = { id: 'uuid-del', title: 'To Delete' };
    mockPrismaService.project.findUnique.mockResolvedValue(mockProject);
    mockPrismaService.project.delete.mockResolvedValue(mockProject);
    
    const result = await service.remove('uuid-del');
    expect(result).toEqual(mockProject);
    expect(prisma.project.delete).toHaveBeenCalledWith({ where: { id: 'uuid-del' } });
  });
});
"""

with open(svc_spec_path, 'w') as f:
    f.write(svc_spec_code)


# DTO updates
create_dto = base_dir + 'dto/create-project.dto.ts'
with open(create_dto, 'r') as f:
    dto_code = f.read()

dto_code = dto_code.replace("clientId?: number;", "clientId?: string;")

with open(create_dto, 'w') as f:
    f.write(dto_code)

print("Done")
