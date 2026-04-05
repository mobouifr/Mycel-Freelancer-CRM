import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Client } from '@prisma/client';

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, createClientDto: CreateClientDto): Promise<Client> {
    return this.prisma.client.create({
      data: {
        name: createClientDto.name,
        email: createClientDto.email,
        phone: createClientDto.phone,
        company: createClientDto.company,
        userId: userId,
      },
    });
  }

  async findAll(userId: string): Promise<Client[]> {
    return this.prisma.client.findMany({
      where: { userId },
    });
  }

  async findOne(userId: string, id: string): Promise<Client> {
    const client = await this.prisma.client.findFirst({
      where: { id, userId },
    });
    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }
    return client;
  }

  async update(userId: string, id: string, updateClientDto: UpdateClientDto): Promise<Client> {
    await this.findOne(userId, id); // Check existence
    return this.prisma.client.update({
      where: { id },
      data: updateClientDto,
    });
  }

  async remove(userId: string, id: string): Promise<Client> {
    await this.findOne(userId, id); // Check existence
    return this.prisma.client.delete({
      where: { id },
    });
  }

  async getProjects(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.project.findMany({ where: { clientId: id, userId } });
  }

  async getProposals(userId: string, id: string) {
    const projects = await this.getProjects(userId, id);
    if (!projects.length) return [];
    return this.prisma.proposal.findMany({ where: { projectId: { in: projects.map(p => p.id) }, userId } });
  }

  async getInvoices(userId: string, id: string) {
    const projects = await this.getProjects(userId, id);
    if (!projects.length) return [];
    return this.prisma.invoice.findMany({ where: { projectId: { in: projects.map(p => p.id) }, userId } });
  }
}
