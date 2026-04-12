import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('clients')
@UseGuards(JwtAuthGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  async findAll(
    @Request() req: any,
    @Query('page')   page?:   string,
    @Query('limit')  limit?:  string,
    @Query('search') search?: string,
  ) {
    const pageNum  = Math.max(1, parseInt(page  || '1',  10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit || '10', 10) || 10));
    return this.clientsService.findAll(req.user.id, pageNum, limitNum, search);
  }

  @Post()
  async create(@Request() req: any, @Body() createClientDto: CreateClientDto) {
    return this.clientsService.create(req.user.id, createClientDto);
  }

  @Get(':id/projects')
  async getProjects(@Request() req: any, @Param('id') id: string) {
    const data = await this.clientsService.getProjects(req.user.id, id);
    return { data };
  }

  @Get(':id')
  async findOne(@Request() req: any, @Param('id') id: string) {
    return this.clientsService.findOne(req.user.id, id);
  }

  @Put(':id')
  async update(@Request() req: any, @Param('id') id: string, @Body() updateClientDto: UpdateClientDto) {
    return this.clientsService.update(req.user.id, id, updateClientDto);
  }

  @Delete(':id')
  async remove(@Request() req: any, @Param('id') id: string) {
    return this.clientsService.remove(req.user.id, id);
  }
}
