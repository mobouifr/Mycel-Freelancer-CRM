import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';

@Injectable()
export class InvoicesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, createInvoiceDto: CreateInvoiceDto) {
    return this.prisma.invoice.create({
      data: {
        ...createInvoiceDto,
        userId,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.invoice.findMany({
      where: { userId },
      include: { project: true },
    });
  }

  async findOne(userId: string, id: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, userId },
      include: { project: true },
    });
    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }
    return invoice;
  }

  async update(userId: string, id: string, updateInvoiceDto: UpdateInvoiceDto) {
    await this.findOne(userId, id); // Verify existence and ownership
    return this.prisma.invoice.update({
      where: { id },
      data: updateInvoiceDto,
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id); // Verify existence and ownership
    return this.prisma.invoice.delete({
      where: { id },
    });
  }
}
