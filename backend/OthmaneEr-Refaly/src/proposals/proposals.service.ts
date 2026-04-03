import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { UpdateProposalDto } from './dto/update-proposal.dto';
import { ProposalStatus } from '@prisma/client';

@Injectable()
export class ProposalsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProposalDto: CreateProposalDto & { userId?: string }) {
    const userId = createProposalDto.userId || '1'; // Default fallback until auth is fully enabled
    const { userId: _, ...data } = createProposalDto as any;
    
    return this.prisma.proposal.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  async findAll() {
    return this.prisma.proposal.findMany({
      include: { project: true },
    });
  }

  async findOne(id: string) {
    const proposal = await this.prisma.proposal.findUnique({
      where: { id },
      include: { project: true },
    });
    if (!proposal) {
      throw new NotFoundException(`Proposal with ID ${id} not found`);
    }
    return proposal;
  }

  async update(id: string, updateProposalDto: UpdateProposalDto) {
    await this.findOne(id); // Verify existence
    return this.prisma.proposal.update({
      where: { id },
      data: updateProposalDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Verify existence
    return this.prisma.proposal.delete({
      where: { id },
    });
  }

  async updateStatus(id: string, status: ProposalStatus) {
    await this.findOne(id);
    return this.prisma.proposal.update({
      where: { id },
      data: { status },
    });
  }

  async generatePdf(id: string) {
    await this.findOne(id);
    return ''; // Placeholder for PDF buffer/stream
  }

  async convertToInvoice(id: string, dueDate?: string) {
    const proposal = await this.findOne(id);
    
    const invoice = await this.prisma.invoice.create({
      data: {
        amount: proposal.amount,
        status: 'PENDING',
        dueDate: dueDate ? new Date(dueDate) : null,
        notes: `Converted from proposal: ${proposal.title}`,
        userId: proposal.userId,
        projectId: proposal.projectId,
      }
    });
    
    return invoice;
  }
}
