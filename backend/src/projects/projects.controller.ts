import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Request, Patch, Query } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  async create(@Request() req: any, @Body() createProjectDto: CreateProjectDto) {
    return await this.projectsService.create(req.user.id, createProjectDto);
  }

  @Get()
  async findAll(
    @Request() req: any,
    @Query('page')   page?:   string,
    @Query('limit')  limit?:  string,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    const pageNum  = Math.max(1, parseInt(page  || '1',  10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit || '10', 10) || 10));
    return this.projectsService.findAll(req.user.id, pageNum, limitNum, search, status);
  }

  @Get(':id')
  async findOne(@Request() req: any, @Param('id') id: string) {
    return await this.projectsService.findOne(req.user.id, id);
  }

  @Put(':id')
  async update(@Request() req: any, @Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return await this.projectsService.update(req.user.id, id, updateProjectDto);
  }

  @Patch(':id/status')
  async updateStatus(@Request() req: any, @Param('id') id: string, @Body('status') status: string) {
    return await this.projectsService.updateStatus(req.user.id, id, status);
  }

  @Delete(':id')
  async remove(@Request() req: any, @Param('id') id: string) {
    return await this.projectsService.remove(req.user.id, id);
  }
}
