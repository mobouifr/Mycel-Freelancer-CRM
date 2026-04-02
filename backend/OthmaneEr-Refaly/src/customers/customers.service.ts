import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Client } from '@prisma/client';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCustomerDto: CreateCustomerDto | any): Promise<Client> {
    const data: any = {
      name: createCustomerDto.name,
      email: createCustomerDto.email,
      phone: createCustomerDto.phone,
      company: createCustomerDto.company,
      userId: createCustomerDto.userId || '1', // default fallback for testing
    };
    return this.prisma.client.create({ data });
  }

  async findAll(): Promise<Client[]> {
    return this.prisma.client.findMany();
  }

  async findOne(id: string): Promise<Client> {
    const customer = await this.prisma.client.findUnique({
      where: { id },
    });
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }
    return customer;
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto): Promise<Client> {
    await this.findOne(id); // Check existence
    return this.prisma.client.update({
      where: { id },
      data: updateCustomerDto,
    });
  }

  async remove(id: string): Promise<Client> {
    await this.findOne(id); // Check existence
    return this.prisma.client.delete({
      where: { id },
    });
  }
}
