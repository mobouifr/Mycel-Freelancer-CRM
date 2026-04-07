import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Client } from '@prisma/client';

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  private normalizeOptionalString(value?: string): string | null {
    if (value === undefined) return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  async create(userId: string, createClientDto: CreateClientDto): Promise<Client> {
    const client = await this.prisma.client.create({
      data: {
        name: createClientDto.name,
        email: this.normalizeOptionalString(createClientDto.email),
        phone: this.normalizeOptionalString(createClientDto.phone),
        company: this.normalizeOptionalString(createClientDto.company),
        notes: this.normalizeOptionalString(createClientDto.notes),
        userId: userId,
      },
    });

    await this.prisma.notification.create({
      data: {
        userId,
        message: `New client created: ${client.name}`,
        type: 'success',
      },
    });

    return client;
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

    const data: UpdateClientDto = {
      ...updateClientDto,
      ...(updateClientDto.email !== undefined
        ? { email: this.normalizeOptionalString(updateClientDto.email) ?? undefined }
        : {}),
      ...(updateClientDto.phone !== undefined
        ? { phone: this.normalizeOptionalString(updateClientDto.phone) ?? undefined }
        : {}),
      ...(updateClientDto.company !== undefined
        ? { company: this.normalizeOptionalString(updateClientDto.company) ?? undefined }
        : {}),
      ...(updateClientDto.notes !== undefined
        ? { notes: this.normalizeOptionalString(updateClientDto.notes) ?? undefined }
        : {}),
    };

    const updatedClient = await this.prisma.client.update({
      where: { id },
      data,
    });

    await this.prisma.notification.create({
      data: {
        userId,
        message: `Client updated: ${updatedClient.name}`,
        type: 'info',
      },
    });

    return updatedClient;
  }

  async remove(userId: string, id: string): Promise<Client> {
    const client = await this.findOne(userId, id); // Check existence
    
    await this.prisma.notification.create({
      data: {
        userId,
        message: `Client deleted: ${client.name}`,
        type: 'warning',
      },
    });

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
