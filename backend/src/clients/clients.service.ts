import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { Client } from '@prisma/client';

@Injectable()
export class ClientsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService
  ) {}

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

    this.notificationsService.create(userId, {
      title: 'Client Created',
      message: `New client created: ${client.name}`,
      type: 'success',
      targetType: 'client',
      targetId: client.id,
    }).catch(() => {});

    return client;
  }

  async findAll(
    userId: string,
    page = 1,
    limit = 10,
    search?: string,
    sortBy = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc',
  ) {
    const skip = (page - 1) * limit;
    const where: any = { userId };
    if (search?.trim()) {
      where.OR = [
        { name:    { contains: search.trim(), mode: 'insensitive' } },
        { email:   { contains: search.trim(), mode: 'insensitive' } },
        { company: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }
    const allowedSortFields = ['name', 'company', 'createdAt'];
    const safeSortBy  = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const safeSortOrd = sortOrder === 'asc' ? 'asc' : 'desc';
    const [data, count] = await Promise.all([
      this.prisma.client.findMany({ where, skip, take: limit, orderBy: { [safeSortBy]: safeSortOrd } }),
      this.prisma.client.count({ where }),
    ]);
    return { data, count, page, limit, totalPages: Math.ceil(count / limit) || 1 };
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

    this.notificationsService.create(userId, {
      title: 'Client Updated',
      message: `Client updated: ${updatedClient.name}`,
      type: 'info',
      targetType: 'client',
      targetId: updatedClient.id,
    }).catch(() => {});

    return updatedClient;
  }

  async remove(userId: string, id: string): Promise<Client> {
    const client = await this.findOne(userId, id); // Check existence

    const deleted = await this.prisma.client.delete({
      where: { id },
    });

    this.notificationsService.create(userId, {
      title: 'Client Deleted',
      message: `Client deleted: ${client.name}`,
      type: 'warning',
    }).catch(() => {});

    return deleted;
  }

  async getProjects(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.project.findMany({ where: { clientId: id, userId } });
  }

}
