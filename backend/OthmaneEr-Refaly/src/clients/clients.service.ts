import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Client } from '@prisma/client';

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createClientDto: CreateClientDto): Promise<Client> {
    return this.prisma.client.create({
      data: {
        name: createClientDto.name,
        email: createClientDto.email,
        phone: createClientDto.phone,
        company: createClientDto.company,
        userId: createClientDto.userId || '1', // default fallback for testing
      },
    });
  }

  async findAll(): Promise<Client[]> {
    return this.prisma.client.findMany();
  }

  async findOne(id: string): Promise<Client> {
    const client = await this.prisma.client.findUnique({
      where: { id },
    });
    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }
    return client;
  }

  async update(id: string, updateClientDto: UpdateClientDto): Promise<Client> {
    await this.findOne(id); // Check existence
    return this.prisma.client.update({
      where: { id },
      data: updateClientDto,
    });
  }

  async remove(id: string): Promise<Client> {
    await this.findOne(id); // Check existence
    return this.prisma.client.delete({
      where: { id },
    });
  }
}
